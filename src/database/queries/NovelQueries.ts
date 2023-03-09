import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');

// import BackgroundService from 'react-native-background-actions';
import * as DocumentPicker from 'expo-document-picker';

// import { fetchChapters, fetchNovel } from '@services/plugin/fetch';
// import { insertChapters } from './ChapterQueries';

import { showToast } from '@hooks/showToast';
import { txnErrorCallback } from '../utils/helpers';
import { noop } from 'lodash-es';
import { getString } from '@strings/translations';

import { NovelInfo } from '../types';

const insertNovelQuery =
  'INSERT INTO Novel (url, plugin_id, name, cover, summary, author, artist, status, genres, in_libary) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

export const insertNovel = async (novel: NovelInfo) => {
  return new Promise(resolve =>
    db.transaction(tx =>
      tx.executeSql(
        insertNovelQuery,
        [
          novel.url,
          novel.pluginId,
          novel.name,
          novel.cover,
          novel.summary,
          novel.author,
          novel.artist,
          novel.status,
          novel.genres,
          novel.inLibrary,
        ],
        (txObj, resultSet) => {
          noop(txObj);
          resolve(resultSet.insertId);
        },
        txnErrorCallback,
      ),
    ),
  );
};

export const toggleNovelToLibrary = async (
  novel: NovelInfo,
  inLibrary: number,
) => {
  db.transaction(tx => {
    tx.executeSql('UPDATE Novel SET in_library = ? WHERE id = ?'),
      [1 - inLibrary, novel.id], // novel.id is enough bc when you browse a novel, it must be in db (cache)
      noop,
      txnErrorCallback;
  });
  if (inLibrary === 1) {
    showToast(getString('browseScreen.removeFromLibrary'));
  } else {
    showToast(getString('browseScreen.addedToLibrary'));
  }
};

export const getNovel = async (novelUrl: string) => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Novel WHERE url = ?',
        [novelUrl],
        (txObj, { rows }) => {
          noop(txObj), resolve(rows.item(0));
        },
        txnErrorCallback,
      );
    }),
  );
};

export const deleteNovelCache = () => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM Novel WHERE in_library = 0',
      [],
      () => showToast('Entries deleted'),
      txnErrorCallback,
    );
  });
};

// const restoreFromBackupQuery =
//   'INSERT INTO novels (novelUrl, sourceUrl, pluginId, source, novelName, novelCover, novelSummary, author, artist, status, genre, followed, unread) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

// export const restoreLibrary = async novel => {
//   return new Promise((resolve, reject) => {
//     db.transaction(tx =>
//       tx.executeSql(
//         restoreFromBackupQuery,
//         [
//           novel.novelUrl,
//           novel.sourceUrl,
//           novel.pluginId,
//           novel.source,
//           novel.novelName,
//           novel.novelCover,
//           novel.novelSummary,
//           novel.author,
//           novel.artist,
//           novel.status,
//           novel.genre,
//           novel.followed,
//           novel.unread,
//         ],
//         async (txObj, { insertId }) => {
//           const chapters = await fetchChapters(novel.pluginId, novel.novelUrl);

//           if (chapters.length) {
//             await insertChapters(insertId, chapters);

//             resolve();
//           }
//         },
//         (txObj, error) => {
//           resolve();
//         },
//       ),
//     );
//   });
// };

// const migrateNovelQuery =
//   'INSERT INTO Novel (url, plugin_id, name, cover, summary, author, artist, status, genres, in_libary) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

// export const migrateNovel = async (pluginId: string, novelUrl: string) => {
//   try {
//     const novel = await fetchNovel(pluginId, novelUrl);

//     const options = {
//       taskName: 'Migration',
//       taskTitle: `Migrating ${novel.novelName} to new source`,
//       taskDesc: novel.pluginName,
//       taskIcon: {
//         name: 'notification_icon',
//         type: 'drawable',
//       },
//       color: '#00adb5',
//       parameters: {
//         delay: 1000,
//       },
//       progressBar: {
//         max: 1,
//         value: 0,
//         indeterminate: true,
//       },
//     };

//     const veryIntensiveTask = async () => {
//       await new Promise(async resolve => {
//         db.transaction(tx =>
//           tx.executeSql(
//             migrateNovelQuery,
//             [
//               novel.novelUrl,
//               novel.sourceUrl,
//               novel.pluginId,
//               novel.source,
//               novel.novelName,
//               novel.novelCover,
//               novel.novelSummary,
//               novel.author,
//               novel.artist,
//               novel.status,
//               novel.genre,
//               1,
//             ],
//             async (txObj, { insertId }) => {
//               const chapters = await fetchChapters(
//                 novel.pluginId,
//                 novel.novelUrl,
//               );
//               await insertChapters(insertId, chapters);
//               resolve();
//             },
//             txnErrorCallback
//           ),
//         );
//       });
//     };

//     await BackgroundService.start(veryIntensiveTask, options);
//     await BackgroundService.updateNotification({
//       progressBar: { value: 1, indeterminate: false },
//     });
//   } catch (error) {
//     showToast(error.message);
//   }
// };

export const updateNovelInfo = async (info: NovelInfo) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Novel SET name = ?, summary = ?, author = ?, genres = ?, status = ? WHERE id = ?',
      [info.name, info.summary, info.author, info.genres, info.status, info.id],
      noop,
      txnErrorCallback,
    );
  });
};

export const pickCustomNovelCover = async (novelId: number) => {
  const image = await DocumentPicker.getDocumentAsync({ type: 'image/*' });

  if (image.type === 'success' && image.uri) {
    const uri = 'file://' + image.uri;

    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Novel SET cover = ? WHERE id = ?',
        [uri, novelId],
        noop,
        txnErrorCallback,
      );
    });
    return image.uri;
  }
};
