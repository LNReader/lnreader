import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');

import * as DocumentPicker from 'expo-document-picker';
import * as RNFS from 'react-native-fs';

import { fetchChapters, fetchNovel } from '@services/plugin/fetch';
import { insertChapters } from './ChapterQueries';

import { showToast } from '@utils/showToast';
import { txnErrorCallback } from '../utils/helpers';
import { noop } from 'lodash-es';
import { getString } from '@strings/translations';
import { BackupNovel, NovelInfo } from '../types';
import { SourceNovel } from '@plugins/types';
import { NovelDownloadFolder } from '@utils/constants/download';

export const insertNovelAndChapters = (
  pluginId: string,
  sourceNovel: SourceNovel,
): Promise<number> => {
  const insertNovelQuery =
    'INSERT INTO Novel (url, pluginId, name, cover, summary, author, artist, status, genres) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        insertNovelQuery,
        [
          sourceNovel.url,
          pluginId,
          sourceNovel.name,
          sourceNovel.cover || null,
          sourceNovel.summary || null,
          sourceNovel.author || null,
          sourceNovel.artist || null,
          sourceNovel.status || null,
          sourceNovel.genres || null,
        ],
        (txObj, resultSet) => {
          if (resultSet.insertId) {
            insertChapters(resultSet.insertId, sourceNovel.chapters).then(() =>
              resolve(resultSet.insertId || 1),
            );
          }
        },
        txnErrorCallback,
      );
    });
  });
};

export const getAllNovels = async (): Promise<NovelInfo[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM Novel', [], (txObj, { rows }) =>
        resolve(rows._array),
      );
    }),
  );
};

export const getNovelsWithCustomCover = async (): Promise<NovelInfo[]> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT id, pluginId, cover FROM Novel WHERE cover NOT LIKE "http%"',
        [],
        (txObj, { rows }) => resolve(rows._array),
      );
    });
  });
};

export const getNovel = async (novelUrl: string): Promise<NovelInfo | null> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Novel WHERE url = ?',
        [novelUrl],
        (txObj, { rows }) => resolve(rows.item(0)),
        txnErrorCallback,
      );
    }),
  );
};

// if query is insert novel || add to library => add default category name for it
// else remove all it's categories

export const switchNovelToLibrary = async (
  novelUrl: string,
  pluginId: string,
) => {
  const novel = await getNovel(novelUrl);
  if (novel) {
    if (novel.isLocal) {
      return;
    }
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Novel SET inLibrary = ? WHERE id = ?',
        [Number(!novel.inLibrary), novel.id],
        noop,
        txnErrorCallback,
      );
      if (novel.inLibrary) {
        tx.executeSql(
          'DELETE FROM NovelCategory WHERE novelId = ?',
          [novel.id],
          () => showToast(getString('browseScreen.removeFromLibrary')),
          txnErrorCallback,
        );
      } else {
        tx.executeSql(
          'INSERT INTO NovelCategory (novelId, categoryId) VALUES (?, (SELECT DISTINCT id FROM Category WHERE sort = 1))',
          [novel.id],
          () => showToast(getString('browseScreen.addedToLibrary')),
          txnErrorCallback,
        );
      }
    });
  } else {
    const sourceNovel = await fetchNovel(pluginId, novelUrl);
    const novelId = await insertNovelAndChapters(pluginId, sourceNovel);
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Novel SET inLibrary = 1 WHERE url = ?',
        [novelUrl],
        () => showToast(getString('browseScreen.addedToLibrary')),
        txnErrorCallback,
      );
      tx.executeSql(
        'INSERT INTO NovelCategory (novelId, categoryId) VALUES (?, (SELECT DISTINCT id FROM Category WHERE sort = 1))',
        [novelId],
        noop,
        txnErrorCallback,
      );
    });
  }
};

// allow to delete local novels
export const removeNovelsFromLibrary = (novelIds: Array<number>) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE Novel SET inLibrary = 0 WHERE id IN (${novelIds.join(', ')});`,
    );
    tx.executeSql(
      `DELETE FROM NovelCategory WHERE novelId IN (${novelIds.join(', ')});`,
    );
  });
  showToast('Removed from Library');
};

export const getCachedNovels = (): Promise<NovelInfo[]> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Novel WHERE inLibrary = 0',
        [],
        (txObj, { rows }) => resolve(rows._array as NovelInfo[]),
        txnErrorCallback,
      );
    });
  });
};
export const deleteCachedNovels = async () => {
  const cachedNovels = await getCachedNovels();
  for (let novel of cachedNovels) {
    const novelDir =
      NovelDownloadFolder + '/' + novel.pluginId + '/' + novel.id;
    if (await RNFS.exists(novelDir)) {
      await RNFS.unlink(novelDir);
    }
  }
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM Novel WHERE inLibrary = 0',
      [],
      () => showToast('Cached novels deleted'),
      txnErrorCallback,
    );
  });
};

const restoreFromBackupQuery =
  'INSERT INTO Novel (url, name, pluginId, cover, summary, author, artist, status, genres, inLibrary) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

export const restoreLibrary = async (novel: NovelInfo) => {
  return new Promise(resolve => {
    db.transaction(tx =>
      tx.executeSql(
        restoreFromBackupQuery,
        [
          novel.url,
          novel.name,
          novel.pluginId,
          novel.cover || '',
          novel.summary || '',
          novel.author || '',
          novel.artist || '',
          novel.status || '',
          novel.genres || '',
          Number(novel.inLibrary),
        ],
        async (txObj, { insertId }) => {
          if (!insertId) {
            return;
          }
          tx.executeSql(
            'INSERT INTO NovelCategory (novelId, categoryId) VALUES (?, (SELECT DISTINCT id FROM Category WHERE sort = 1))',
            [insertId],
            noop,
            txnErrorCallback,
          );
          const chapters = await fetchChapters(novel.pluginId, novel.url);

          if (chapters) {
            await insertChapters(insertId, chapters);
            resolve(insertId);
          }
        },
        txnErrorCallback,
      ),
    );
  });
};

export const updateNovelInfo = async (info: NovelInfo) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Novel SET name = ?, cover = ?, url = ? , summary = ?, author = ?, artist = ?, genres = ?, status = ?, isLocal = ? WHERE id = ?',
      [
        info.name,
        info.cover || '',
        info.url,
        info.summary || '',
        info.author || '',
        info.artist || '',
        info.genres || '',
        info.status || '',
        Number(info.isLocal),
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

export const updateNovelCategories = async (
  novelIds: number[],
  categoryIds: number[],
  option: string,
): Promise<void> => {
  let queries: string[] = [];
  // allow local novels have other categories, but not the revesre
  categoryIds = categoryIds.filter(id => id !== 2);
  if (option === 'KEEP_OLD') {
    novelIds.forEach(novelId => {
      categoryIds.forEach(categoryId =>
        queries.push(
          `INSERT OR REPLACE INTO NovelCategory (novelId, categoryId) VALUES (${novelId}, ${categoryId})`,
        ),
      );
    });
  } else {
    novelIds.forEach(novelId =>
      queries.push(`DELETE FROM NovelCategory WHERE novelId = ${novelId}`),
    );
    novelIds.forEach(novelId => {
      categoryIds.forEach(categoryId =>
        queries.push(
          `INSERT INTO NovelCategory (novelId, categoryId) VALUES (${novelId}, ${categoryId})`,
        ),
      );
    });
  }
  return new Promise(resolve => {
    db.transaction(tx => {
      queries.forEach((query, index) => {
        tx.executeSql(
          query,
          [],
          () => {
            if (index === queries.length - 1) {
              resolve();
            }
          },
          txnErrorCallback,
        );
      });
    });
  });
};

export const _restoreNovelAndChapters = (novel: BackupNovel) => {
  db.transaction(tx => {
    tx.executeSql('DELETE FROM Novel WHERE id = ?', [novel.id]);
    tx.executeSql(
      `INSERT INTO 
        Novel (
          id, url, pluginId, name, cover, summary, 
          author, artist, status, genres, inLibrary, isLocal
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        novel.id,
        novel.url,
        novel.pluginId,
        novel.name,
        novel.cover || null,
        novel.summary || null,
        novel.author || null,
        novel.artist || null,
        novel.status || null,
        novel.genres || null,
        Number(novel.inLibrary),
        Number(novel.isLocal),
      ],
    );
    for (const chapter of novel.chapters) {
      tx.executeSql(
        `INSERT INTO 
          Chapter (
            id, novelId, url, name, releaseTime, bookmark,
            unread, readTime, isDownloaded, updatedTime
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          chapter.id,
          chapter.novelId,
          chapter.url,
          chapter.name,
          chapter.releaseTime || null,
          Number(chapter.bookmark),
          Number(chapter.unread),
          chapter.readTime,
          Number(chapter.isDownloaded),
          chapter.updatedTime,
        ],
      );
    }
  });
};
