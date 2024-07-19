import * as SQLite from 'expo-sqlite/legacy';
import { showToast } from '@utils/showToast';
import { ChapterInfo, DownloadedChapter } from '../types';
import { ChapterItem } from '@plugins/types';

import { txnErrorCallback } from '@database/utils/helpers';
import { Update } from '../types';
import { noop } from 'lodash-es';
import { getString } from '@strings/translations';
import FileManager from '@native/FileManager';
import { NOVEL_STORAGE } from '@utils/Storages';
import getDb from '@database/openDB';

const insertChapterQuery = `
INSERT OR IGNORE INTO Chapter (path, name, releaseTime, novelId, chapterNumber, page, position)
VALUES (?, ?, ?, ?, ?, ?, ?)
`;

export const insertChapters = async (
  novelId: number,
  chapters?: ChapterItem[],
) => {
  const db = await getDb();
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
          if (!insertId || insertId < 0) {
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

const getPageChaptersQuery = (sort = 'ORDER BY position ASC', filter = '') =>
  `SELECT * FROM Chapter WHERE novelId = ? AND page = ? ${filter} ${sort}`;

export const getCustomPages = async (
  novelId: number,
): Promise<{ page: string }[]> => {
  const db = await getDb();
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

export const getNovelChapters = async (
  novelId: number,
): Promise<ChapterInfo[]> => {
  const db = await getDb();
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

export const getChapter = async (
  chapterId: number,
): Promise<ChapterInfo | null> => {
  const db = await getDb();
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Chapter WHERE id = ?',
        [chapterId],
        (txObj, { rows }) => resolve(rows.item(0)),
        txnErrorCallback,
      );
    }),
  );
};

export const getPageChapters = async (
  novelId: number,
  sort?: string,
  filter?: string,
  page?: string,
): Promise<ChapterInfo[]> => {
  const db = await getDb();
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getPageChaptersQuery(sort, filter),
        [novelId, page || '1'],
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

export const getPrevChapter = async (
  novelId: number,
  chapterId: number,
): Promise<ChapterInfo | null> => {
  const db = await getDb();
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

export const getNextChapter = async (
  novelId: number,
  chapterId: number,
): Promise<ChapterInfo | null> => {
  const db = await getDb();
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
  const db = await getDb();
  db.transaction(tx => {
    tx.executeSql(markChapterReadQuery, [chapterId], noop, (_txObj, _error) => {
      // console.log(error)
      return false;
    });
  });
};

export const markChaptersRead = async (chapterIds: number[]) => {
  const db = await getDb();
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE Chapter SET \`unread\` = 0 WHERE id IN (${chapterIds.join(',')})`,
      undefined,
      noop,
      txnErrorCallback,
    );
  });
};

const markChapterUnreadQuery = 'UPDATE Chapter SET `unread` = 1 WHERE id = ?';

export const markChapterUnread = async (chapterId: number) => {
  const db = await getDb();
  db.transaction(tx => {
    tx.executeSql(markChapterUnreadQuery, [chapterId], noop, txnErrorCallback);
  });
};

export const markChaptersUnread = async (chapterIds: number[]) => {
  const db = await getDb();
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE Chapter SET \`unread\` = 1 WHERE id IN (${chapterIds.join(',')})`,
      undefined,
      noop,
      txnErrorCallback,
    );
  });
};

const markAllChaptersReadQuery =
  'UPDATE Chapter SET `unread` = 0 WHERE novelId = ?';

export const markAllChaptersRead = async (novelId: number) => {
  const db = await getDb();
  db.transaction(tx => {
    tx.executeSql(markAllChaptersReadQuery, [novelId], noop, txnErrorCallback);
  });
};

const markAllChaptersUnreadQuery =
  'UPDATE Chapter SET `unread` = 1 WHERE novelId = ?';

export const markAllChaptersUnread = async (novelId: number) => {
  const db = await getDb();
  db.transaction(tx => {
    tx.executeSql(
      markAllChaptersUnreadQuery,
      [novelId],
      noop,
      txnErrorCallback,
    );
  });
};

const deleteDownloadedFiles = async (
  pluginId: string,
  novelId: number,
  chapterId: number,
) => {
  try {
    const chapterFolder = `${NOVEL_STORAGE}/${pluginId}/${novelId}/${chapterId}`;
    await FileManager.unlink(chapterFolder);
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
  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
  db.transaction(tx => {
    tx.executeSql('UPDATE Chapter SET progress = ? WHERE id = ?', [
      progress,
      chapterId,
    ]);
  });
};

export const updateChapterProgressByIds = async (
  chapterIds: number[],
  progress: number,
) => {
  const db = await getDb();
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE Chapter SET progress = ? WHERE id in (${chapterIds.join(',')})`,
      [progress],
    );
  });
};

const bookmarkChapterQuery =
  'UPDATE Chapter SET bookmark = (CASE WHEN bookmark = 0 THEN 1 ELSE 0 END) WHERE id = ?';

export const bookmarkChapter = async (chapterId: number) => {
  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
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

export const getDownloadedChapters = async (): Promise<DownloadedChapter[]> => {
  const db = await getDb();
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

export const getUpdatesFromDb = async (): Promise<Update[]> => {
  const db = await getDb();
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

export const clearUpdates = async () => {
  const db = await getDb();
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Chapter SET updatedTime = NULL',
      [],
      noop,
      txnErrorCallback,
    );
  });
};
