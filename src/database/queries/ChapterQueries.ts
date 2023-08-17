import RNFS from 'react-native-fs';
import * as SQLite from 'expo-sqlite';
import { showToast } from '@hooks/showToast';
import { getPlugin } from '@plugins/pluginManager';
import { ChapterInfo, DownloadedChapter } from '../types';
import { ChapterItem } from '@plugins/types';

import * as cheerio from 'cheerio';
import { txnErrorCallback } from '@database/utils/helpers';
import { Plugin } from '@plugins/types';
import { Update } from '../types';
import { noop } from 'lodash-es';

const db = SQLite.openDatabase('lnreader.db');

const insertChapterQuery = `
INSERT INTO Chapter (
  url, name, releaseTime, novelId
) 
Values 
  (?, ?, ?, ?)
`;

export const insertChapters = async (
  novelId: number,
  chapters?: ChapterItem[],
) => {
  if (!chapters?.length) {
    return;
  }
  db.transaction(tx => {
    chapters.forEach(chapter => {
      tx.executeSql(
        insertChapterQuery,
        [
          chapter.url,
          chapter.name,
          chapter.releaseTime ? chapter.releaseTime : '',
          novelId,
        ],
        noop,
        txnErrorCallback,
      );
    });
  });
};

const getChaptersQuery = (sort = 'ORDER BY id ASC', filter = '') =>
  `SELECT id, * FROM Chapter WHERE novelId = ? ${filter} ${sort}`;

export const getChapters = (
  novelId: number,
  sort: string,
  filter: string,
): Promise<ChapterInfo[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getChaptersQuery(sort, filter),
        [novelId],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

// downloaded chapter
const getChapterQuery =
  'SELECT chapterText FROM Download WHERE Download.chapterId = ?';

export const getChapterFromDB = (chapterId: number): Promise<string> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getChapterQuery,
        [chapterId],
        (txObj, { rows }) => resolve(rows.item(0)?.chapterText),
        txnErrorCallback,
      );
    }),
  );
};

const getPrevChapterQuery = `
  SELECT
    id, *
  FROM
    Chapter
  WHERE
    novelId = ?
  AND
    id < ?
  `;

export const getPrevChapter = (
  novelId: number,
  chapterId: number,
): Promise<ChapterInfo> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getPrevChapterQuery,
        [novelId, chapterId],
        (_txObj, results) =>
          resolve(results.rows.item(results.rows.length - 1)),
        () => {
          showToast("There's no previous chapter");
          return false;
        },
      );
    }),
  );
};

const getNextChapterQuery = `
  SELECT
    id, *
  FROM
    Chapter
  WHERE
    novelId = ?
  AND
    id > ?
  `;

export const getNextChapter = (
  novelId: number,
  chapterId: number,
): Promise<ChapterInfo> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getNextChapterQuery,
        [novelId, chapterId],
        (_txObj, results) => resolve(results.rows.item(0)),
        () => {
          showToast("There's no next Chapter");
          return false;
        },
      );
    }),
  );
};

const markChapterReadQuery = 'UPDATE Chapter SET `unread` = 0 WHERE id = ?';

export const markChapterRead = async (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(markChapterReadQuery, [chapterId], noop, (_txObj, _error) => {
      // console.log(error)
      return false;
    });
  });
};

const markChapterUnreadQuery = 'UPDATE Chapter SET `unread` = 1 WHERE id = ?';

export const markChapterUnread = async (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(markChapterUnreadQuery, [chapterId], noop, txnErrorCallback);
  });
};

const markAllChaptersReadQuery =
  'UPDATE Chapter SET `unread` = 0 WHERE novelId = ?';

export const markAllChaptersRead = async (novelId: number) => {
  db.transaction(tx => {
    tx.executeSql(markAllChaptersReadQuery, [novelId], noop, txnErrorCallback);
  });
};

const markAllChaptersUnreadQuery =
  'UPDATE Chapter SET `unread` = 1 WHERE novelId = ?';

export const markAllChaptersUnread = async (novelId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      markAllChaptersUnreadQuery,
      [novelId],
      noop,
      txnErrorCallback,
    );
  });
};

const downloadChapterQuery =
  'INSERT INTO Download (chapterId, chapterText) VALUES (?, ?)';

const createImageFolder = async (
  path: string,
  data: {
    pluginId: string;
    novelId: number;
    chapterId: number;
  },
): Promise<string> => {
  const mkdirIfNot = async (p: string, nomedia: boolean) => {
    const nomediaPath =
      p + (p.charAt(p.length - 1) === '/' ? '' : '/') + '.nomedia';
    if (!(await RNFS.exists(p))) {
      await RNFS.mkdir(p);
      if (nomedia) {
        await RNFS.writeFile(nomediaPath, ',', 'utf8');
      }
    }
  };

  await mkdirIfNot(path, false);

  const { pluginId, novelId, chapterId } = data;
  await mkdirIfNot(`${path}/${pluginId}/${novelId}/${chapterId}/`, true);
  return `${path}/${pluginId}/${novelId}/${chapterId}/`;
};

const downloadImages = async (
  html: string,
  plugin: Plugin,
  novelId: number,
  chapterId: number,
): Promise<string> => {
  try {
    const loadedCheerio = cheerio.load(html);
    const imgs = loadedCheerio('img').toArray();
    for (let i = 0; i < imgs.length; i++) {
      const elem = loadedCheerio(imgs[i]);
      const url = elem.attr('src');
      if (url) {
        const imageb64 = await plugin.fetchImage(url);
        const fileurl =
          (await createImageFolder(`${RNFS.DownloadDirectoryPath}/LNReader`, {
            pluginId: plugin.id,
            novelId,
            chapterId,
          }).catch(() => {
            showToast(
              `Unexpected storage error!\nRemove ${fileurl} and try downloading again`,
            );
            return '--';
          })) +
          i +
          '.b64.png';
        if (fileurl.charAt(0) === '-') {
          return loadedCheerio.html();
        }
        elem.attr('src', `file://${fileurl}`);
        RNFS.writeFile(fileurl, imageb64, 'base64').catch(() => {
          showToast(
            `Unexpected storage error!\nRemove ${fileurl} and try downloading again`,
          );
        });
      }
    }
    loadedCheerio('body').prepend("<input type='hidden' offline />");
    return loadedCheerio.html();
  } catch (e) {
    return html;
  }
};

// novelId for determine folder %LNReaderDownloadDir%/novelId/ChapterId/
export const downloadChapter = async (
  pluginId: string,
  novelId: number,
  chapterId: number,
  chapterUrl: string,
) => {
  try {
    const plugin = getPlugin(pluginId);
    if (!plugin) {
      throw new Error('Plugin not found!');
    }
    const chapterText = await plugin.parseChapter(chapterUrl);
    if (chapterText?.length) {
      const imagedChapterText =
        chapterText &&
        (await downloadImages(chapterText, plugin, novelId, chapterId));

      if (!chapterText) {
        return showToast('Cant download chapter from url' + chapterUrl);
      }
      db.transaction(tx => {
        tx.executeSql(
          "UPDATE Chapter SET isDownloaded = 1, updatedTime = datetime('now','localtime') WHERE id = ?",
          [chapterId],
        );
        tx.executeSql(
          downloadChapterQuery,
          [chapterId, imagedChapterText],
          (_txObj, _res) => {
            return true;
          },
          txnErrorCallback,
        );
      });
    } else {
      throw new Error("Either chapter is empty or the app couldn't scrape it");
    }
  } catch (error) {
    throw error;
  }
};

const deleteDownloadedImages = async (
  pluginId: string,
  novelId: number,
  chapterId: number,
) => {
  try {
    const path = await createImageFolder(
      `${RNFS.DownloadDirectoryPath}/LNReader`,
      { pluginId, novelId, chapterId },
    );
    const files = await RNFS.readDir(path);
    for (let i = 0; i < files.length; i++) {
      const ex = /\.b64\.png/.exec(files[i].path);
      if (ex) {
        await RNFS.unlink(files[i].path);
      }
    }
  } catch (error) {
    throw new Error('Cant delete chapter image folder');
  }
};

// delete downloaded chapter
export const deleteChapter = async (
  pluginId: string,
  novelId: number,
  chapterId: number,
) => {
  const updateIsDownloadedQuery =
    'UPDATE Chapter SET isDownloaded = 0 WHERE id = ?';
  const deleteChapterQuery = 'DELETE FROM Download WHERE chapterId = ?';

  await deleteDownloadedImages(pluginId, novelId, chapterId);

  db.transaction(tx => {
    tx.executeSql(updateIsDownloadedQuery, [chapterId], noop, txnErrorCallback);
    tx.executeSql(deleteChapterQuery, [chapterId], noop, txnErrorCallback);
  });
};

export const deleteChapters = async (
  pluginId: string,
  novelId: number,
  chapters?: DownloadedChapter[],
) => {
  if (!chapters?.length) {
    return;
  }

  const chapterIdsString = chapters?.map(chapter => chapter.id).toString();

  const updateIsDownloadedQuery = `UPDATE Chapter SET isDownloaded = 0 WHERE id IN (${chapterIdsString})`;
  const deleteChapterQuery = `DELETE FROM Download WHERE chapterId IN (${chapterIdsString})`;

  await Promise.all(
    chapters?.map(chapter =>
      deleteDownloadedImages(pluginId, novelId, chapter.id),
    ),
  );

  db.transaction(tx => {
    tx.executeSql(
      updateIsDownloadedQuery,
      undefined,
      undefined,
      txnErrorCallback,
    );
    tx.executeSql(deleteChapterQuery, undefined, undefined, txnErrorCallback);
  });
};

export const deleteDownloads = async (chapters: DownloadedChapter[]) => {
  await Promise.all(
    chapters?.map(chapter => {
      deleteDownloadedImages(chapter.pluginId, chapter.novelId, chapter.id);
    }),
  );
  db.transaction(tx => {
    tx.executeSql('UPDATE Chapter SET isDownloaded = 0');
    tx.executeSql('DELETE FROM Download; VACCUM;');
    showToast('Deleted all Downloads');
  });
};

const getReadDownloadedChapters = async (): Promise<DownloadedChapter[]> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        `
        SELECT Chapter.id, Chapter.novelId, pluginId 
        FROM Chapter
        JOIN Novel
        ON Novel.id = Chapter.novelId AND unread = 0 AND isDownloaded = 1`,
        [],
        (txObj, { rows }) => resolve((rows as any)._array),
      );
    });
  });
};

export const deleteReadChaptersFromDb = async () => {
  const chapters = await getReadDownloadedChapters();
  await Promise.all(
    chapters?.map(chapter => {
      deleteDownloadedImages(
        chapter.pluginId,
        chapter.novelId,
        chapter.novelId,
      );
    }),
  );
  const chapterIdsString = chapters?.map(chapter => chapter.id).toString();

  const updateIsDownloadedQuery = `UPDATE Chapter SET isDownloaded = 0 WHERE id IN (${chapterIdsString})`;
  const deleteChapterQuery = `DELETE FROM Download WHERE chapterId IN (${chapterIdsString})`;

  db.transaction(tx => {
    tx.executeSql(updateIsDownloadedQuery, [], noop, txnErrorCallback);
    tx.executeSql(deleteChapterQuery, [], noop, txnErrorCallback);
  });
  showToast('Read chapters deleted');
};

const bookmarkChapterQuery = 'UPDATE Chapter SET bookmark = ? WHERE id = ?';

export const bookmarkChapter = async (bookmark: number, chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      bookmarkChapterQuery,
      [1 - bookmark, chapterId],
      (_txObj, _res) => {},
      (_txObj, _error) => {
        // console.log('Error ', error)
        return false;
      },
    );
  });
};

const markPreviuschaptersReadQuery =
  'UPDATE Chapter SET `unread` = 0 WHERE id < ? AND novelId = ?';

export const markPreviuschaptersRead = async (
  chapterId: number,
  novelId: number,
) => {
  db.transaction(tx => {
    tx.executeSql(
      markPreviuschaptersReadQuery,
      [chapterId, novelId],
      (_txObj, _res) => {},
      (_txObj, _error) => {
        // console.log(error)
        return false;
      },
    );
  });
};

const markPreviousChaptersUnreadQuery =
  'UPDATE Chapter SET `unread` = 1 WHERE id < ? AND novelId = ?';

export const markPreviousChaptersUnread = async (
  chapterId: number,
  novelId: number,
) => {
  db.transaction(tx => {
    tx.executeSql(
      markPreviousChaptersUnreadQuery,
      [chapterId, novelId],
      (_txObj, _res) => {},
      (_txObj, _error) => {
        // console.log(error)
        return false;
      },
    );
  });
};

const getDownloadedChaptersQuery = `
    SELECT
      Chapter.*,
      Novel.pluginId, Novel.name as novelName, Novel.cover as novelCover, Novel.url as novelUrl
    FROM Chapter
    JOIN Novel
    ON Chapter.novelId = Novel.id
    WHERE Chapter.isDownloaded = 1
  `;

export const getDownloadedChapters = () => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getDownloadedChaptersQuery,
        undefined,
        (txObj, { rows }) => {
          resolve((rows as any)._array);
        },
        (_txObj, _error) => {
          // console.log('Error ', error)
          return false;
        },
      );
    }),
  );
};

const getUpdatesQuery = `
SELECT
  Chapter.id, Chapter.*,
  pluginId, Novel.id as novelId, Novel.name as novelName, Novel.url as novelUrl, cover as novelCover
FROM
  Chapter
JOIN
  Novel
ON Chapter.novelId = Novel.id AND Chapter.updatedTime IS NOT NULL
ORDER BY Chapter.updatedTime DESC
`;

export const getUpdatesFromDb = (): Promise<Update[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getUpdatesQuery,
        [],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

export const clearUpdates = () => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Chapter SET updatedTime = NULL',
      [],
      noop,
      txnErrorCallback,
    );
  });
};
