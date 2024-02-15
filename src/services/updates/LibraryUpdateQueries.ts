import { fetchImage, fetchNovel } from '../plugin/fetch';
import { downloadChapter } from '../../database/queries/ChapterQueries';

import * as SQLite from 'expo-sqlite';
import { SourceNovel } from '@plugins/types';
import { LOCAL_PLUGIN_ID } from '@plugins/pluginManager';
import { NovelDownloadFolder } from '@utils/constants/download';
import * as RNFS from 'react-native-fs';
import { getMMKVObject, setMMKVObject } from '@utils/mmkv/mmkv';
import { NOVEL_PAGES_PREFIX, NovelPage } from '@hooks/persisted/useNovel';
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
          VALUES (?, ?, ?, ?, datetime('now','localtime'), ?)
          ON CONFLICT(novelId, path) DO UPDATE SET
            name=excluded.name,
            releaseTime=excluded.releaseTime,
            updatedTime=excluded.updatedTime
            page=excluded.page
          WHERE Chapter.name != excluded.name
            OR Chapter.releaseTime != excluded.releaseTime;
        `,
        [path, name, releaseTime || '', novelId, page || '1'],
        (txObj, { insertId }) => {
          if (insertId && downloadNewChapters) {
            downloadChapter(pluginId, novelId, insertId, path);
          }
        },
      );
    });
  });
  const novelPages = getMMKVObject<NovelPage[]>(
    `${NOVEL_PAGES_PREFIX}_${pluginId}_${novelPath}`,
  );
  if (novelPages) {
    setMMKVObject(`${NOVEL_PAGES_PREFIX}_${pluginId}_${novelPath}`, {
      ...novelPages,
      pages: novelPages.map(p => {
        return {
          ...p,
          hasUpdate: true,
        };
      }),
    });
  }
};

export { updateNovel };
