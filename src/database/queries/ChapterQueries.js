import * as SQLite from 'expo-sqlite';
import { getSource } from '../../sources/sources';
const db = SQLite.openDatabase('lnreader.db');

const insertChaptersQuery =
  'INSERT INTO chapters (chapterUrl, chapterName, releaseDate, novelId) values (?, ?, ?, ?)';

export const insertChapters = async (novelId, chapters) => {
  db.transaction(tx => {
    chapters.map(
      chapter =>
        tx.executeSql(
          insertChaptersQuery,
          [
            chapter.chapterUrl,
            chapter.chapterName,
            chapter.releaseDate,
            novelId,
          ],
          (txObj, res) => {},
          (txObj, error) => {},
          // console.log(
          //     "Error ",
          //     error,
          //     " Chapter URL: ",
          //     chapter.chapterUrl,
          //     " Novel ID ",
          //     novelId
          // )
        ),
      (txObj, res) => {
        // console.log('Success');
      },
      (txObj, error) => {
        // console.log('Error ', error)
      },
    );
  });
};

const getChaptersQuery = (sort = 'ORDER BY chapterId ASC', filter = '') =>
  `SELECT * FROM chapters WHERE novelId = ? ${filter} ${sort}`;

export const getChapters = (novelId, sort, filter) => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        getChaptersQuery(sort, filter),
        [novelId],
        (txObj, { rows: { _array } }) => {
          resolve(_array);
        },
        (txObj, error) => {
          // console.log('Error ', error)
        },
      );
    }),
  );
};

const getChapterQuery = 'SELECT * FROM downloads WHERE downloadChapterId = ?';

export const getChapterFromDB = async chapterId => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        getChapterQuery,
        [chapterId],
        (txObj, results) => {
          resolve(results.rows.item(0));
        },
        (txObj, error) => {
          // console.log('Error ', error)
        },
      );
    }),
  );
};

export const getNextChapterFromDB = async (novelId, chapterId) => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM chapters WHERE novelId = ? AND chapterId > ?',
        [novelId, chapterId],
        (txObj, results) => {
          resolve(results.rows.item(0));
        },
        (txObj, error) => {
          // console.log('Error ', error)
        },
      );
    }),
  );
};

export const getPrevChapterFromDB = async (novelId, chapterId) => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM chapters WHERE novelId = ? AND chapterId < ?',
        [novelId, chapterId],
        (txObj, results) => {
          resolve(results.rows.item(results.rows.length - 1));
        },
        (txObj, error) => {
          // console.log('Error ', error)
        },
      );
    }),
  );
};

const markChapterReadQuery =
  'UPDATE chapters SET `read` = 1 WHERE chapterId = ?';

export const markChapterRead = async chapterId => {
  db.transaction(tx => {
    tx.executeSql(
      markChapterReadQuery,
      [chapterId],
      (txObj, res) => {},
      (txObj, error) => {
        // console.log(error)
      },
    );
  });
};

const markChapterUnreadQuery =
  'UPDATE chapters SET `read` = 0 WHERE chapterId = ?';

export const markChapterUnread = async chapterId => {
  db.transaction(tx => {
    tx.executeSql(
      markChapterUnreadQuery,
      [chapterId],
      (txObj, res) => {},
      (txObj, error) => {
        // console.log(error)
      },
    );
  });
};

const markAllChaptersReadQuery =
  'UPDATE chapters SET `read` = 1 WHERE novelId = ?';

export const markAllChaptersRead = async novelId => {
  db.transaction(tx => {
    tx.executeSql(
      markAllChaptersReadQuery,
      [novelId],
      (txObj, res) => {},
      (txObj, error) => {
        // console.log(error)
      },
    );
  });
};

const markAllChaptersUnreadQuery =
  'UPDATE chapters SET `read` = 0 WHERE novelId = ?';

export const markAllChaptersUnread = async novelId => {
  db.transaction(tx => {
    tx.executeSql(
      markAllChaptersUnreadQuery,
      [novelId],
      (txObj, res) => {},
      (txObj, error) => {
        // console.log(error)
      },
    );
  });
};

const isChapterDownloadedQuery =
  'SELECT * FROM downloads WHERE downloadChapterId=?';

export const isChapterDownloaded = async chapterId => {
  return new Promise((resolve, reject) =>
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
        (txObj, error) => {
          // console.log('Error ', error)
        },
      );
    }),
  );
};

const downloadChapterQuery =
  'INSERT INTO downloads (downloadChapterId, chapterName, chapterText) VALUES (?, ?, ?)';

export const downloadChapter = async (
  sourceId,
  novelUrl,
  chapterUrl,
  chapterId,
) => {
  const source = getSource(sourceId);

  const chapter = await source.parseChapter(novelUrl, chapterUrl);

  db.transaction(tx => {
    tx.executeSql('UPDATE chapters SET downloaded = 1 WHERE chapterId = ?', [
      chapterId,
    ]);
    tx.executeSql(
      downloadChapterQuery,
      [chapterId, chapter.chapterName, chapter.chapterText],
      (txObj, res) => {
        // console.log(`Downloaded Chapter ${chapter.chapterUrl}`);
      },
      (txObj, error) => {
        // console.log('Error ', error)
      },
    );
  });
};

export const deleteChapter = async chapterId => {
  const updateIsDownloadedQuery =
    'UPDATE chapters SET downloaded = 0 WHERE chapterId=?';
  const deleteChapterQuery = 'DELETE FROM downloads WHERE downloadChapterId=?';

  db.transaction(tx => {
    tx.executeSql(
      updateIsDownloadedQuery,
      [chapterId],
      (txObj, res) => {},
      (txObj, error) => {
        // console.log('Error ', error)
      },
    );
    tx.executeSql(
      deleteChapterQuery,
      [chapterId],
      (txObj, res) => {
        // console.log('Chapter deleted');
      },
      (txObj, error) => {
        // console.log('Error ', error)
      },
    );
  });
};

const getLastReadChapterQuery = `
    SELECT chapters.*
    FROM history
    JOIN chapters
    ON history.historyChapterId = chapters.chapterId
    WHERE history.historyNovelId = ?
`;

export const getLastReadChapter = async novelId => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        getLastReadChapterQuery,
        [novelId],
        (txObj, { rows }) => resolve(rows.item(0)),
        (txObj, error) => {
          // console.log('Error ', error)
        },
      );
    });
  });
};

const bookmarkChapterQuery =
  'UPDATE chapters SET bookmark = ? WHERE chapterId = ?';

export const bookmarkChapter = async (bookmark, chapterId) => {
  db.transaction(tx => {
    tx.executeSql(
      bookmarkChapterQuery,
      [!bookmark, chapterId],
      (txObj, res) => {},
      (txObj, error) => {
        // console.log('Error ', error)
      },
    );
  });
};

const markPreviuschaptersReadQuery =
  'UPDATE chapters SET `read` = 1 WHERE chapterId < ? AND novelId = ?';

export const markPreviuschaptersRead = async (chapterId, novelId) => {
  db.transaction(tx => {
    tx.executeSql(
      markPreviuschaptersReadQuery,
      [chapterId, novelId],
      (txObj, res) => {},
      (txObj, error) => {
        // console.log(error)
      },
    );
  });
};

const markPreviousChaptersUnreadQuery =
  'UPDATE chapters SET `read` = 0 WHERE chapterId < ? AND novelId = ?';

export const markPreviousChaptersUnread = async (chapterId, novelId) => {
  db.transaction(tx => {
    tx.executeSql(
      markPreviousChaptersUnreadQuery,
      [chapterId, novelId],
      (txObj, res) => {},
      (txObj, error) => {
        // console.log(error)
      },
    );
  });
};

const getDownloadedChaptersQuery = `
    SELECT chapters.*, novels.sourceId, novels.novelName, novels.novelCover, novels.novelUrl
    FROM chapters
    JOIN novels
    ON chapters.novelId = novels.novelId
    WHERE chapters.downloaded = 1`;

export const getDownloadedChapters = () => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        getDownloadedChaptersQuery,
        null,
        (txObj, { rows: { _array } }) => {
          resolve(_array);
        },
        (txObj, error) => {
          // console.log('Error ', error)
        },
      );
    }),
  );
};

export const deleteDownloads = async () => {
  db.transaction(tx => {
    tx.executeSql('UPDATE chapters SET downloaded = 0');
    tx.executeSql('DELETE FROM downloads; VACCUM;');
  });
};
