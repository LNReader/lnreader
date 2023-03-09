import RNFS from 'react-native-fs';
import * as SQLite from 'expo-sqlite';
import { showToast } from '@hooks/showToast';
import { getPlugin } from '@plugins/pluginManager';
import { ChapterItem } from '../types';
import { SourceChapter } from '@plugins/types';

import * as cheerio from 'cheerio';
import { txnErrorCallback } from '@database/utils/helpers';
import { Plugin } from '@plugins/types';
import { Update } from '../types';

const db = SQLite.openDatabase('lnreader.db');

const insertChaptersQuery = `
INSERT INTO Chapter (
  url, name, release_time, novel_id
) 
values 
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
    chapters.map(chapter =>
      tx.executeSql(insertChaptersQuery, [
        chapter.url,
        chapter.name,
        chapter.release,
        novelId,
      ]),
    );
  });
};

const getChaptersQuery = (sort = 'ORDER BY id ASC', filter = '') =>
  `SELECT * FROM Chapter WHERE novel_id = ? ${filter} ${sort}`;

export const getChapters = (novelId: number, sort: string, filter: string) => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getChaptersQuery(sort, filter),
        [novelId],
        (txObj, { rows }) => {
          const _array = (rows as any)._array;
          resolve(_array);
        },
        txnErrorCallback,
      );
    }),
  );
};

const getChapterQuery =
  'SELECT * FROM Chapter JOIN Download ON Chapter.id = Download.chapter_id WHERE Chapter.id = ?';

export const getChapterFromDB = async (
  chapterId: number,
): Promise<SourceChapter> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getChapterQuery,
        [chapterId],
        (txObj, results) => {
          resolve(results.rows.item(0));
        },
        (_txObj, _error) => {
          // console.log('Error ', error)
          return false;
        },
      );
    }),
  );
};

const getPrevChapterQuery = `
  SELECT
    *
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
): Promise<ChapterItem> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getPrevChapterQuery,
        [novelId, chapterId],
        (_txObj, results) =>
          resolve(results.rows.item(results.rows.length - 1)),
        (_txObj, error) => {
          showToast(error.message);
          return false;
        },
      );
    }),
  );
};

const getNextChapterQuery = `
  SELECT
    *
  FROM
    Chapter
  WHERE
    novelId = ?
  AND
    chapterId > ?
  `;

export const getNextChapter = (
  novelId: number,
  chapterId: number,
): Promise<ChapterItem> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getNextChapterQuery,
        [novelId, chapterId],
        (_txObj, results) => resolve(results.rows.item(0)),
        (_txObj, error) => {
          showToast(error.message);
          return false;
        },
      );
    }),
  );
};

const markChapterReadQuery = 'UPDATE Chapter SET `unread` = 0 WHERE id = ?';

export const markChapterRead = async (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      markChapterReadQuery,
      [chapterId],
      (_txObj, _res) => {},
      (_txObj, _error) => {
        // console.log(error)
        return false;
      },
    );
  });
};

const markChapterUnreadQuery = 'UPDATE Chapter SET `unread` = 1 WHERE id = ?';

export const markChapterUnread = async (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      markChapterUnreadQuery,
      [chapterId],
      (_txObj, _res) => {},
      (_txObj, _error) => {
        // console.log(error)
        return false;
      },
    );
  });
};

const markAllChaptersReadQuery =
  'UPDATE Chapter SET `unread` = 0 WHERE novelId = ?';

export const markAllChaptersRead = async (novelId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      markAllChaptersReadQuery,
      [novelId],
      (_txObj, _res) => {},
      (_txObj, _error) => {
        // console.log(error)
        return false;
      },
    );
  });
};

const markAllChaptersUnreadQuery =
  'UPDATE Chapter SET `unread` = 1 WHERE novelId = ?';

export const markAllChaptersUnread = async (novelId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      markAllChaptersUnreadQuery,
      [novelId],
      (_txObj, _res) => {},
      (_txObj, _error) => {
        // console.log(error)
        return false;
      },
    );
  });
};

const isChapterDownloadedQuery = 'SELECT * FROM Download WHERE id = ?';

export const isChapterDownloaded = async (chapterId: number) => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        isChapterDownloadedQuery,
        [chapterId],
        (txObj, res) => {
          if (res.rows.length !== 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        (_txObj, _error) => {
          // console.log('Error ', error)
          return false;
        },
      );
    }),
  );
};

const downloadChapterQuery =
  'INSERT INTO Download (chapterId, name, chapterText) VALUES (?, ?, ?)';

const createImageFolder = async (
  path: string,
  data: {
    pluginId: string;
    novelId: number;
    chapterId: number;
  },
): Promise<string> => {
  const mkdirIfNot = async (p: string) => {
    const nomediaPath =
      p + (p.charAt(p.length - 1) === '/' ? '' : '/') + '.nomedia';
    if (!(await RNFS.exists(p))) {
      await RNFS.mkdir(p);
      await RNFS.writeFile(nomediaPath, ',', 'utf8');
    }
  };

  await mkdirIfNot(path);

  const { pluginId, novelId, chapterId } = data;
  await mkdirIfNot(`${path}/${pluginId}/${novelId}/${chapterId}/`);
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

export const downloadChapter = async (
  pluginId: string,
  novelUrl: string,
  novelId: number,
  chapterUrl: string,
  chapterId: number,
) => {
  try {
    const plugin = getPlugin(pluginId);

    const chapter = await plugin.parseChapter(novelUrl, chapterUrl);

    if (chapter.chapterText?.length) {
      const imagedChapterText =
        chapter.chapterText &&
        (await downloadImages(chapter.chapterText, plugin, novelId, chapterId));

      db.transaction(tx => {
        tx.executeSql('UPDATE Chapter SET isDownloaded = 1 WHERE id = ?', [
          chapterId,
        ]);
        tx.executeSql(
          downloadChapterQuery,
          [chapterId, chapter.name, imagedChapterText],
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
    tx.executeSql(
      updateIsDownloadedQuery,
      [chapterId],
      (_txObj, _res) => {},
      (_txObj, _error) => {
        // console.log('Error ', error)
        return false;
      },
    );
    tx.executeSql(
      deleteChapterQuery,
      [chapterId],
      (_txObj, _res) => {
        // console.log('Chapter deleted');
      },
      (_txObj, _error) => {
        // console.log('Error ', error)
        return false;
      },
    );
  });
};

export const deleteChapters = async (
  pluginId: string,
  chapters?: ChapterItem[],
) => {
  if (!chapters?.length) {
    return;
  }

  const chapterIdsString = chapters?.map(chapter => chapter.id).toString();

  const updateIsDownloadedQuery = `UPDATE Chapter SET isDownload = 0 WHERE id IN (${chapterIdsString})`;
  const deleteChapterQuery = `DELETE FROM Download WHERE chapterId IN (${chapterIdsString})`;

  await Promise.all(
    chapters?.map(chapter =>
      deleteDownloadedImages(pluginId, chapter.novelId, chapter.id),
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

const getLastReadChapterQuery = `
    SELECT Chapter.*
    FROM History
    JOIN Chapter
    ON History.chapterId = Chapter.id
    WHERE Chapter.novelId = ?
`;

export const getLastReadChapter = async (novelId: number) => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getLastReadChapterQuery,
        [novelId],
        (txObj, { rows }) => resolve(rows.item(0)),
        (_txObj, _error) => {
          // console.log('Error ', error)
          return false;
        },
      );
    });
  });
};

const bookmarkChapterQuery = 'UPDATE Chapter SET bookmark = ? WHERE id = ?';

export const bookmarkChapter = async (bookmark: boolean, chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      bookmarkChapterQuery,
      [!bookmark, chapterId],
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
    SELECT Chapter.*, Novel.pluginId, Novel.name, Novel.cover, Novel.url
    FROM Chapter
    JOIN Novel
    ON Chapter.novelId = Novel.id
    WHERE Chapter.isDownloaded = 1`;

export const getDownloadedChapters = () => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getDownloadedChaptersQuery,
        undefined,
        (txObj, { rows }) => {
          const _array = (rows as any)._array;
          resolve(_array);
        },
        (_txObj, _error) => {
          // console.log('Error ', error)
          return false;
        },
      );
    }),
  );
};

export const deleteDownloads = async () => {
  db.transaction(tx => {
    tx.executeSql('UPDATE Chapter SET isdownload = 0');
    tx.executeSql('DELETE FROM Download; VACCUM;');
  });
};

const getUpdatesQuery = `
SELECT
  pluginId, Novel.id as novelId, Novel.name as novelName, Novel.url as novelUrl, cover,
  Chapter.id as chapterId, Chapter.url as chapterUrl, Chapter.name as chapterName, releaseTime,
  updateTime
FROM
  Chapter
JOIN
  Novel
ON Chapter.novel_id = Novel.id AND Chapter.is_downloaded = 1
JOIN Download ON Chapter.id = Download.chapter_id
`;

export const getUpdatesFromDb = (): Promise<Update[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(getUpdatesQuery, [], (txObj, { rows }) =>
        resolve((rows as any)._array),
      );
    }),
  );
};
