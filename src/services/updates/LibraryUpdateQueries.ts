import { fetchImage, fetchNovel } from '../plugin/fetch';
import { downloadChapter } from '../../database/queries/ChapterQueries';

import * as SQLite from 'expo-sqlite';
import { SourceNovel } from '@plugins/types';
import { LOCAL_PLUGIN_ID } from '@plugins/pluginManager';
import { NovelDownloadFolder } from '@utils/constants/download';
import * as RNFS from 'react-native-fs';
import { getMMKVObject, setMMKVObject } from '@utils/mmkv/mmkv';
import { NOVEL_PAGE_UPDATES_PREFIX } from '@hooks/persisted/useNovel';
const db = SQLite.openDatabase('lnreader.db');

const updateNovelMetadata = async (
  pluginId: string,
  novelId: number,
  novel: SourceNovel,
) => {
  let { name, cover, summary, author, artist, genres, status, totalPages } =
    novel;
  const novelDir = NovelDownloadFolder + '/' + pluginId + '/' + novelId;
  if (cover) {
    const novelCoverUri = 'file://' + novelDir + '/cover.png';
    await fetchImage(pluginId, cover).then(base64 => {
      if (base64) {
        cover = novelCoverUri;
        return RNFS.writeFile(novelCoverUri, base64, 'base64');
      }
    });
    cover += '?' + Date.now();
  }
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE Novel SET 
        name = ?, cover = ?, summary = ?, author = ?, artist = ?, 
        genres = ?, status = ?, totalPages = ?
        WHERE id = ?
      `,
      [
        name,
        cover || null,
        summary || null,
        author || 'unknown',
        artist || null,
        genres || null,
        status || null,
        totalPages || 0,
        novelId,
      ],
    );
  });
};

export interface UpdateNovelOptions {
  downloadNewChapters?: boolean;
  refreshNovelMetadata?: boolean;
}

const updateNovel = async (
  pluginId: string,
  novelPath: string,
  novelId: number,
  options: UpdateNovelOptions,
) => {
  if (pluginId === LOCAL_PLUGIN_ID) {
    return;
  }
  const { downloadNewChapters, refreshNovelMetadata } = options;
  const novel = await fetchNovel(pluginId, novelPath);
  if (refreshNovelMetadata) {
    updateNovelMetadata(pluginId, novelId, novel);
  }
  db.transaction(tx => {
    novel.chapters.forEach(chapter => {
      const { name, path, releaseTime, page } = chapter;
      tx.executeSql(
        `
          INSERT INTO Chapter (path, name, releaseTime, novelId, updatedTime, page)
          SELECT ?, ?, ?, ?, datetime('now','localtime'), ?
          WHERE NOT EXISTS (SELECT id FROM Chapter WHERE path = ? AND novelId = ?);
        `,
        [path, name, releaseTime || null, novelId, page || '1', path, novelId],
        (txObj, { insertId }) => {
          if (insertId) {
            if (downloadNewChapters) {
              downloadChapter(pluginId, novelId, insertId, path);
            }
          } else {
            tx.executeSql(
              `
                UPDATE Chapter SET 
                  name = ?, releaseTime = ?, updatedTime = datetime('now','localtime'), page = ?
                WHERE path = ? AND novelId = ? AND (name != ? OR releaseTime != ? OR page != ?);
              `,
              [
                name,
                releaseTime || null,
                page || '1',
                path,
                novelId,
                name,
                releaseTime || null,
                page || '1',
              ],
            );
          }
        },
      );
    });
  });
  const key = `${NOVEL_PAGE_UPDATES_PREFIX}_${novelId}`;
  const hasUpdates = getMMKVObject<boolean[]>(key);
  if (hasUpdates) {
    setMMKVObject(
      key,
      hasUpdates.map(() => true),
    );
  }
};

export { updateNovel };
