import RNFS from 'react-native-fs';
import * as SQLite from 'expo-sqlite';
import { showToast } from '@hooks/showToast';
import { getPlugin } from '@plugins/pluginManager';
import { Chapter, ExtendedChapter } from '../types';
import { ChapterItem } from '@plugins/types';

import * as cheerio from 'cheerio';
import { txnErrorCallback } from '@database/utils/helpers';
import { Plugin } from '@plugins/types';
import { noop } from 'lodash-es';

const db = SQLite.openDatabase('lnreader.db');

export const insertChapters = async (
  novelId: number,
  chapters?: ChapterItem[],
) => {
  if (!chapters?.length) {
    return;
  }
  const insertChapterQuery = `
    INSERT INTO Chapter (url, name, releaseTime, novelId) 
    VALUES (?, ?, ?, ?)
  `;
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

export const getChapters = (
  novelId: number,
  sort: string,
  filter: string,
): Promise<Chapter[]> => {
  const getChaptersQuery = (sort = 'ORDER BY id ASC', filter = '') =>
    `SELECT * FROM Chapter WHERE novelId = ? ${filter} ${sort}`;
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getChaptersQuery(sort, filter),
        [novelId],
        (txObj, { rows }) => resolve(rows._array),
        txnErrorCallback,
      );
    }),
  );
};

export const getChapterFromDB = (chapterId: number): Promise<string> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT chapterText FROM Download WHERE chapterId = ?',
        [chapterId],
        (txObj, { rows }) => resolve(rows.item(0)?.chapterText),
        txnErrorCallback,
      );
    }),
  );
};

export const getPrevChapter = (
  novelId: number,
  chapterId: number,
): Promise<Chapter> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Chapter WHERE novelId = ? AND id < ?',
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

export const getNextChapter = (
  novelId: number,
  chapterId: number,
): Promise<Chapter> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Chapter WHERE novelId = ? AND id > ?',
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

export const markChapterRead = async (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Chapter SET `unread` = 0 WHERE id = ?',
      [chapterId],
      noop,
      txnErrorCallback,
    );
  });
};

export const markChapterUnread = async (chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Chapter SET `unread` = 1 WHERE id = ?',
      [chapterId],
      noop,
      txnErrorCallback,
    );
  });
};

export const markAllChaptersRead = async (novelId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Chapter SET `unread` = 0 WHERE novelId = ?',
      [novelId],
      noop,
      txnErrorCallback,
    );
  });
};

export const markAllChaptersUnread = async (novelId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Chapter SET `unread` = 1 WHERE novelId = ?',
      [novelId],
      noop,
      txnErrorCallback,
    );
  });
};

const createImageFolder = async (
  path: string,
  chapter: ExtendedChapter,
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
  const fullPath = `${path}/${chapter.novel.pluginId}/${chapter.novel.id}/${chapter.id}`;
  await mkdirIfNot(fullPath);
  return fullPath;
};

const downloadImages = async (
  html: string,
  plugin: Plugin,
  chapter: ExtendedChapter,
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
          (await createImageFolder(
            `${RNFS.DownloadDirectoryPath}/LNReader`,
            chapter,
          ).catch(() => {
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

// novelId for determine folder %LNReaderDownloadDir%/pluginId/novelId/ChapterId/
export const downloadChapter = async (chapter: ExtendedChapter) => {
  try {
    const plugin = getPlugin(chapter.novel.pluginId);
    const chapterText = await plugin.parseChapter(chapter.url);
    if (chapterText?.length) {
      const imagedChapterText =
        chapterText && (await downloadImages(chapterText, plugin, chapter));

      if (!chapterText) {
        return showToast('Cant download chapter from url ' + chapter.url);
      }
      db.transaction(tx => {
        tx.executeSql(
          "UPDATE Chapter SET isDownloaded = 1, updatedTime = datetime('now','localtime') WHERE id = ?",
          [chapter.id],
        );
        tx.executeSql(
          'INSERT INTO Download (chapterId, chapterText) VALUES (?, ?)',
          [chapter.id, imagedChapterText],
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

const deleteDownloadedImages = async (chapter: ExtendedChapter) => {
  try {
    const path = await createImageFolder(
      `${RNFS.DownloadDirectoryPath}/LNReader`,
      chapter,
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
export const deleteChapter = async (chapter: ExtendedChapter) => {
  const updateIsDownloadedQuery =
    'UPDATE Chapter SET isDownloaded = 0 WHERE id = ?';
  const deleteChapterQuery = 'DELETE FROM Download WHERE chapterId = ?';

  await deleteDownloadedImages(chapter);

  db.transaction(tx => {
    tx.executeSql(
      updateIsDownloadedQuery,
      [chapter.id],
      noop,
      txnErrorCallback,
    );
    tx.executeSql(deleteChapterQuery, [chapter.id], noop, txnErrorCallback);
  });
};

export const deleteChapters = async (chapters?: ExtendedChapter[]) => {
  if (!chapters?.length) {
    return;
  }

  const chapterIdsString = chapters?.map(chapter => chapter.id).toString();

  const updateIsDownloadedQuery = `UPDATE Chapter SET isDownloaded = 0 WHERE id IN (${chapterIdsString})`;
  const deleteChapterQuery = `DELETE FROM Download WHERE chapterId IN (${chapterIdsString})`;

  await Promise.all(chapters?.map(chapter => deleteDownloadedImages(chapter)));

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

export const deleteDownloads = async (chapters: ExtendedChapter[]) => {
  await Promise.all(
    chapters?.map(chapter => {
      deleteDownloadedImages(chapter);
    }),
  );
  db.transaction(tx => {
    tx.executeSql('UPDATE Chapter SET isDownloaded = 0');
    tx.executeSql('DELETE FROM Download; VACCUM;');
    showToast('Deleted all Downloads');
  });
};

const getReadDownloadedChapters = async (): Promise<ExtendedChapter[]> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Chapter WHERE unread = 0 AND isDownloaded = 1',
        [],
        (txObj, { rows }) => {
          Promise.all(
            rows._array.map(chapter => fetchEagerChapter(chapter)),
          ).then(res => resolve(res));
        },
      );
    });
  });
};

export const deleteReadChaptersFromDb = async () => {
  const chapters = await getReadDownloadedChapters();
  await Promise.all(
    chapters?.map(chapter => {
      deleteDownloadedImages(chapter);
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

export const bookmarkChapter = async (bookmark: number, chapterId: number) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Chapter SET bookmark = ? WHERE id = ?',
      [1 - bookmark, chapterId],
      noop,
      txnErrorCallback,
    );
  });
};

export const markPreviuschaptersRead = async (
  chapterId: number,
  novelId: number,
) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Chapter SET `unread` = 0 WHERE id < ? AND novelId = ?',
      [chapterId, novelId],
      noop,
      txnErrorCallback,
    );
  });
};

export const markPreviousChaptersUnread = async (
  chapterId: number,
  novelId: number,
) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Chapter SET `unread` = 1 WHERE id < ? AND novelId = ?',
      [chapterId, novelId],
      noop,
      txnErrorCallback,
    );
  });
};

export const getDownloadedChapters = () => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Chapter WHERE isDownloaded',
        [],
        (txObj, { rows }) => {
          Promise.all(
            rows._array.map(chapter => fetchEagerChapter(chapter)),
          ).then(res => resolve(res));
        },
        txnErrorCallback,
      );
    }),
  );
};

export const getUpdatesFromDb = (): Promise<ExtendedChapter[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Chapter WHERE updatedTime IS NOT NULL',
        [],
        (txObj, { rows }) => {
          Promise.all(
            rows._array.map(chapter => fetchEagerChapter(chapter)),
          ).then(res => resolve(res));
        },
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
