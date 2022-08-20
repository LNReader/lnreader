import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');

import BackgroundService from 'react-native-background-actions';
import * as DocumentPicker from 'expo-document-picker';

import { fetchChapters, fetchNovel } from '../../services/Source/source';
import { insertChapters } from './ChapterQueries';

import { showToast } from '../../hooks/showToast';
import { txnErrorCallback } from '../utils/helpers';
import { noop } from 'lodash';

const insertNovelQuery =
  'INSERT INTO novels (novelUrl, sourceUrl, sourceId, source, novelName, novelCover, novelSummary, author, artist, status, genre, categoryIds) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

export const insertNovel = async novel => {
  return new Promise((resolve, reject) =>
    db.transaction(tx =>
      tx.executeSql(
        insertNovelQuery,
        [
          novel.novelUrl,
          novel.sourceUrl,
          novel.sourceId,
          novel.source,
          novel.novelName,
          novel.novelCover || '',
          novel.novelSummary,
          novel.author,
          novel.artist,
          novel.status,
          novel.genre,
          JSON.stringify(novel.categoryIds),
        ],
        (txObj, { insertId }) => resolve(insertId),
        txnErrorCallback,
      ),
    ),
  );
};

export const followNovel = async (followed, novelId) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE novels SET followed = ? WHERE novelId = ?',
      [!followed, novelId],
      (txo, res) => {},
      (txObj, error) => {
        // console.log('Error ', error)
      },
    );
  });
};

export const unfollowNovel = async novelId => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE novels SET followed = 0 WHERE novelId = ?',
      [novelId],
      (txo, res) => {},
      (txObj, error) => {
        // console.log('Error ', error)
      },
    );
  });
};

const checkNovelInCacheQuery = 'SELECT * FROM novels WHERE novelUrl=? LIMIT 1';

export const checkNovelInCache = novelUrl => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        checkNovelInCacheQuery,
        [novelUrl],
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

export const getNovel = async (sourceId, novelUrl) => {
  return new Promise((resolve, reject) =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM novels WHERE novelUrl = ? AND sourceId = ?',
        [novelUrl, sourceId],
        (txObj, { rows }) => resolve(rows.item(0)),
        (txObj, error) => {
          // console.log('Error ', error)
        },
      );
    }),
  );
};

export const deleteNovelCache = () => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM novels WHERE followed = 0',
      null,
      (txObj, res) => showToast('Entries deleted'),
      (txObj, error) => {
        // console.log('Error ', error)
      },
    );
  });
};

const restoreFromBackupQuery =
  'INSERT INTO novels (novelUrl, sourceUrl, sourceId, source, novelName, novelCover, novelSummary, author, artist, status, genre, followed, unread) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

export const restoreLibrary = async novel => {
  return new Promise((resolve, reject) => {
    db.transaction(tx =>
      tx.executeSql(
        restoreFromBackupQuery,
        [
          novel.novelUrl,
          novel.sourceUrl,
          novel.sourceId,
          novel.source,
          novel.novelName,
          novel.novelCover,
          novel.novelSummary,
          novel.author,
          novel.artist,
          novel.status,
          novel.genre,
          novel.followed,
          novel.unread,
        ],
        async (txObj, { insertId }) => {
          const chapters = await fetchChapters(novel.sourceId, novel.novelUrl);

          if (chapters) {
            await insertChapters(insertId, chapters);

            resolve();
          }
        },
        (txObj, error) => {
          resolve();
        },
      ),
    );
  });
};

const migrateNovelQuery =
  'INSERT INTO novels (novelUrl, sourceUrl, sourceId, source, novelName, novelCover, novelSummary, author, artist, status, genre, followed) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

export const migrateNovel = async (sourceId, novelUrl) => {
  try {
    const novel = await fetchNovel(sourceId, novelUrl);

    const options = {
      taskName: 'Migration',
      taskTitle: `Migrating ${novel.novelName} to new source`,
      taskDesc: novel.source,
      taskIcon: {
        name: 'notification_icon',
        type: 'drawable',
      },
      color: '#00adb5',
      parameters: {
        delay: 1000,
      },
      progressBar: {
        max: 1,
        value: 0,
        indeterminate: true,
      },
    };

    const veryIntensiveTask = async () => {
      await new Promise(async resolve => {
        db.transaction(tx =>
          tx.executeSql(
            migrateNovelQuery,
            [
              novel.novelUrl,
              novel.sourceUrl,
              novel.sourceId,
              novel.source,
              novel.novelName,
              novel.novelCover,
              novel.novelSummary,
              novel.author,
              novel.artist,
              novel.status,
              novel.genre,
              1,
            ],
            async (txObj, { insertId }) => {
              const chapters = await fetchChapters(
                novel.sourceId,
                novel.novelUrl,
              );
              await insertChapters(insertId, chapters);
              resolve();
            },
            (txObj, error) => {
              // console.log('Error ', error)
            },
          ),
        );
      });
    };

    await BackgroundService.start(veryIntensiveTask, options);
    await BackgroundService.updateNotification({
      progressBar: { value: 1, indeterminate: false },
    });
  } catch (error) {
    showToast(error.message);
  }
};

export const updateNovelInfo = async (info, novelId) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE novels SET novelName = ?, novelSummary = ?, author = ?, genre = ?, status = ? WHERE novelId = ?',
      [
        info.novelName,
        info.novelSummary,
        info.author,
        info.genre,
        info.status,
        novelId,
      ],
      (txObj, res) => {},
      (txObj, error) => {
        // console.log('Error ', error)
      },
    );
  });
};

export const pickCustomNovelCover = async novelId => {
  const image = await DocumentPicker.getDocumentAsync({ type: 'image/*' });

  if (image.type === 'success' && image.uri) {
    const uri = 'file://' + image.uri;

    db.transaction(tx => {
      tx.executeSql(
        'UPDATE novels SET novelCover = ? WHERE novelId = ?',
        [uri, novelId],
        (txObj, res) => {},
        (txObj, error) => showToast(`Error: ${error}`),
      );
    });

    return image.uri;
  }
};
