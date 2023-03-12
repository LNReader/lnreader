import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');

// import BackgroundService from 'react-native-background-actions';
import * as DocumentPicker from 'expo-document-picker';

// import { fetchChapters, fetchNovel } from '@services/plugin/fetch';
import { insertChapters } from './ChapterQueries';

import { showToast } from '@hooks/showToast';
import { txnErrorCallback } from '../utils/helpers';
import { noop } from 'lodash-es';
import { getString } from '@strings/translations';
import { NovelInfo } from '../types';
import { SourceNovel } from '@plugins/types';
import { fetchNovel } from '@services/plugin/fetch';

/**
  * @param PluginType
  Browse novels with @NovelItem (url - absolute, name, cover)

  * @param DatabaseType
  Longpress to add Novel to Library | BrowseSource -> Parse novel and chapters ( @SourceNovel including @ChapterItem ) -> insert @Novel and @Chapters
  Longpress to remove Novel from Library -> only change @inLibrary field of novel
  Get novels in Library with @LibraryNovelInfo (id, url, name, pluginId, cover, unreadChapters, downloadedChapters, lastReadAt, lastUpdatedAt)
  NovelScreen will use @NovelInfo (same as in Novel table)
  Click "heart" to add or remove -> change @inLibrary (because novel and chapters were already in db)
  Auto create Novel Category Default (@sort = 1) by Trigger
**/

export const insertNovelandChapters = async (
  pluginId: string,
  sourceNovel: SourceNovel,
) => {
  const insertNovelQuery =
    'INSERT INTO Novel (url, pluginId, name, cover, summary, author, artist, status, genres) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.transaction(tx => {
    tx.executeSql(
      insertNovelQuery,
      [
        sourceNovel.url,
        pluginId,
        sourceNovel.name,
        sourceNovel.cover,
        sourceNovel.summary || '',
        sourceNovel.author,
        sourceNovel.artist,
        sourceNovel.status,
        sourceNovel.genres || '',
      ],
      (txObj, resultSet) =>
        insertChapters(resultSet.insertId, sourceNovel.chapters),
      txnErrorCallback,
    );
  });
};

export const getNovel = async (novelUrl: string): Promise<NovelInfo> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT id, * FROM Novel WHERE url = ?',
        [novelUrl],
        (txObj, { rows }) => resolve(rows.item(0)),
        txnErrorCallback,
      );
    }),
  );
};

export const switchNovelToLibrary = async (
  novelUrl: string,
  pluginId: string,
) => {
  const novel = await getNovel(novelUrl);
  if (novel) {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Novel SET inLibrary = ? WHERE id = ?',
        [1 - novel.inLibrary, novel.id],
        noop,
        txnErrorCallback,
      );
    });
    if (novel.inLibrary === 1) {
      showToast(getString('browseScreen.removeFromLibrary'));
    } else {
      showToast(getString('browseScreen.addedToLibrary'));
    }
  } else {
    const sourceNovel = await fetchNovel(pluginId, novelUrl);
    insertNovelandChapters(pluginId, sourceNovel);
    db.transaction(tx => {
      tx.executeSql('UPDATE Novel SET inLibrary = 1 WHERE url = ?'),
        [novelUrl],
        noop,
        txnErrorCallback;
    });
  }
};

export const deleteNovelCache = () => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM Novel WHERE inLibrary = 0',
      [],
      () => showToast('Cached novels deleted'),
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
      [
        info.name,
        info.summary || '',
        info.author,
        info.genres || '',
        info.status,
        info.id,
      ],
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

export const updateNovelCategoryById = async (
  novelId: number,
  categoryIds: number[],
) => {
  db.transaction(tx => {
    categoryIds.forEach(categoryId => {
      tx.executeSql(
        'INSERT INTO NovelCategory (novelId, categoryId) VALUES (?, ?)',
        [novelId, categoryId],
        noop,
        txnErrorCallback,
      );
    });
  });
};
