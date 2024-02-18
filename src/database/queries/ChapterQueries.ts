import RNFS from 'react-native-fs';
import * as SQLite from 'expo-sqlite';
import { showToast } from '@utils/showToast';
import { getPlugin } from '@plugins/pluginManager';
import { ChapterInfo, DownloadedChapter } from '../types';
import { ChapterItem } from '@plugins/types';

import * as cheerio from 'cheerio';
import { NovelDownloadFolder } from '@utils/constants/download';
import { txnErrorCallback } from '@database/utils/helpers';
import { Plugin } from '@plugins/types';
import { Update } from '../types';
import { noop } from 'lodash-es';
import { getString } from '@strings/translations';

const db = SQLite.openDatabase('lnreader.db');

const insertChapterQuery = `
INSERT OR IGNORE INTO Chapter (path, name, releaseTime, novelId, chapterNumber, page, position)
VALUES (?, ?, ?, ?, ?, ?, ?)
`;

export const insertChapters = async (
  novelId: number,
  chapters?: ChapterItem[],
) => {
  if (!chapters?.length) {
    return;
  }
  db.transaction(tx => {
    chapters.forEach((chapter, index) => {
      tx.executeSql(
        insertChapterQuery,
        [
          chapter.path,
          chapter.name,
          chapter.releaseTime || '',
          novelId,
          chapter.chapterNumber || null,
          chapter.page || '1',
          index,
        ],
        (txObj, { insertId }) => {
          if (!insertId) {
            tx.executeSql(
              `
                UPDATE Chapter SET
                  page = ?, position = ?
                WHERE path = ? AND novelId = ? (AND page != ? OR position != ?)
              `,
              [
                chapter.page || '1',
                index,
                chapter.path,
                novelId,
                chapter.page || '1',
                index,
              ],
            );
          }
        },
      );
    });
  });
};

const getPageChaptersQuery = (
  sort = 'ORDER BY position ASC',
  filter = '',
  page = '1',
) =>
  `SELECT * FROM Chapter WHERE novelId = ? AND page = '${page}' ${filter} ${sort}`;

export const getCustomPages = (
  novelId: number,
): Promise<{ page: string }[]> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT DISTINCT page from Chapter WHERE novelId = ?',
        [novelId],
        (txObj, { rows }) => resolve(rows._array),
      );
    });
  });
};

export const getNovelChapters = (novelId: number): Promise<ChapterInfo[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Chapter WHERE novelId = ?',
        [novelId],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

export const getPageChapters = (
  novelId: number,
  sort?: string,
  filter?: string,
  page?: string,
): Promise<ChapterInfo[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getPageChaptersQuery(sort, filter, page),
        [novelId],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
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
): Promise<ChapterInfo> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getPrevChapterQuery,
        [novelId, chapterId],
        (_txObj, results) =>
          resolve(results.rows.item(results.rows.length - 1)),
        () => {
          showToast(getString('readerScreen.noPreviousChapter'));
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
          showToast(getString('readerScreen.noNextChapter'));
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

const createChapterFolder = async (
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

const downloadFiles = async (
  html: string,
  plugin: Plugin,
  novelId: number,
  chapterId: number,
): Promise<void> => {
  try {
    const folder = await createChapterFolder(NovelDownloadFolder, {
      pluginId: plugin.id,
      novelId,
      chapterId,
    }).catch(error => {
      throw error;
    });
    const loadedCheerio = cheerio.load(html);
    const imgs = loadedCheerio('img').toArray();
    for (let i = 0; i < imgs.length; i++) {
      const elem = loadedCheerio(imgs[i]);
      const url = elem.attr('src');
      if (url) {
        const imageb64 = await plugin.fetchImage(url);
        const fileurl = folder + i + '.b64.png';
        elem.attr('src', `file://${fileurl}`);
        RNFS.writeFile(fileurl, imageb64, 'base64');
      }
    }
    RNFS.writeFile(folder + 'index.html', loadedCheerio.html());
  } catch (error) {
    throw error;
  }
};

// novelId for determine folder %LNReaderDownloadDir%/novelId/ChapterId/
export const downloadChapter = async (
  pluginId: string,
  novelId: number,
  chapterId: number,
  chapterPath: string,
) => {
  try {
    const plugin = getPlugin(pluginId);
    if (!plugin) {
      throw new Error(getString('downloadScreen.pluginNotFound'));
    }
    const chapterText = await plugin.parseChapter(chapterPath);
    if (chapterText && chapterText.length) {
      await downloadFiles(chapterText, plugin, novelId, chapterId);
      db.transaction(tx => {
        tx.executeSql(
          "UPDATE Chapter SET isDownloaded = 1, updatedTime = datetime('now','localtime') WHERE id = ?",
          [chapterId],
        );
      });
    } else {
      throw new Error(getString('downloadScreen.chapterEmptyOrScrapeError'));
    }
  } catch (error) {
    throw error;
  }
};

const deleteDownloadedFiles = async (
  pluginId: string,
  novelId: number,
  chapterId: number,
) => {
  try {
    const path = await createChapterFolder(NovelDownloadFolder, {
      pluginId,
      novelId,
      chapterId,
    });
    const files = await RNFS.readDir(path);
    for (let i = 0; i < files.length; i++) {
      await RNFS.unlink(files[i].path);
    }
    await RNFS.unlink(path);
  } catch (error) {
    throw new Error(getString('novelScreen.deleteChapterError'));
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

  await deleteDownloadedFiles(pluginId, novelId, chapterId);

  db.transaction(tx => {
    tx.executeSql(updateIsDownloadedQuery, [chapterId], noop, txnErrorCallback);
  });
};

export const deleteChapters = async (
  pluginId: string,
  novelId: number,
  chapters?: ChapterInfo[],
) => {
  if (!chapters?.length) {
    return;
  }

  const chapterIdsString = chapters?.map(chapter => chapter.id).toString();

  const updateIsDownloadedQuery = `UPDATE Chapter SET isDownloaded = 0 WHERE id IN (${chapterIdsString})`;

  await Promise.all(
    chapters?.map(chapter =>
      deleteDownloadedFiles(pluginId, novelId, chapter.id),
    ),
  );

  db.transaction(tx => {
    tx.executeSql(
      updateIsDownloadedQuery,
      undefined,
      undefined,
      txnErrorCallback,
    );
  });
};

export const deleteDownloads = async (chapters: DownloadedChapter[]) => {
  await Promise.all(
    chapters?.map(chapter => {
      deleteDownloadedFiles(chapter.pluginId, chapter.novelId, chapter.id);
    }),
  );
  db.transaction(tx => {
    tx.executeSql('UPDATE Chapter SET isDownloaded = 0', [], () =>
      showToast(getString('novelScreen.deletedAllDownloads')),
    );
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
      deleteDownloadedFiles(chapter.pluginId, chapter.novelId, chapter.novelId);
    }),
  );
  const chapterIdsString = chapters?.map(chapter => chapter.id).toString();

  const updateIsDownloadedQuery = `UPDATE Chapter SET isDownloaded = 0 WHERE id IN (${chapterIdsString})`;

  db.transaction(tx => {
    tx.executeSql(updateIsDownloadedQuery, [], noop, txnErrorCallback);
  });
  showToast(getString('novelScreen.readChaptersDeleted'));
};

export const updateChapterProgress = async (
  chapterId: number,
  progress: number,
) => {
  db.transaction(tx => {
    tx.executeSql('UPDATE Chapter SET progress = ? WHERE id = ?', [
      progress,
      chapterId,
    ]);
  });
};

const bookmarkChapterQuery =
  'UPDATE Chapter SET bookmark = (CASE WHEN bookmark = 0 THEN 1 ELSE 0 END) WHERE id = ?';

export const bookmarkChapter = async (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(bookmarkChapterQuery, [chapterId]);
  });
};

const markPreviuschaptersReadQuery =
  'UPDATE Chapter SET `unread` = 0 WHERE id <= ? AND novelId = ?';

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
  'UPDATE Chapter SET `unread` = 1 WHERE id <= ? AND novelId = ?';

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
      Novel.pluginId, Novel.name as novelName, Novel.cover as novelCover, Novel.path as novelPath
    FROM Chapter
    JOIN Novel
    ON Chapter.novelId = Novel.id
    WHERE Chapter.isDownloaded = 1
  `;

export const getDownloadedChapters = (): Promise<DownloadedChapter[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getDownloadedChaptersQuery,
        undefined,
        (txObj, { rows }) => {
          resolve(rows._array);
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
  Chapter.*,
  pluginId, Novel.id as novelId, Novel.name as novelName, Novel.path as novelPath, cover as novelCover
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
