import { fetchImage, fetchNovel } from '../plugin/fetch';
import { downloadChapter } from '../../database/queries/ChapterQueries';

import * as SQLite from 'expo-sqlite';
import { SourceNovel } from '@plugins/types';
import { LOCAL_PLUGIN_ID } from '@plugins/pluginManager';
import { NovelDownloadFolder } from '@utils/constants/download';
import * as RNFS from 'react-native-fs';
const db = SQLite.openDatabase('lnreader.db');

const updateNovelMetadata = async (
  pluginId: string,
  novelId: number,
  novel: SourceNovel,
) => {
  let { name, cover, summary, author, artist, genres, status } = novel;
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
      'UPDATE Novel SET name = ?, cover = ?, summary = ?, author = ?, artist = ?, genres = ?, status = ? WHERE id = ?',
      [
        name,
        cover || null,
        summary || '',
        author || 'unknown',
        artist || '',
        genres || '',
        status || '',
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
  novelUrl: string,
  novelId: number,
  options: UpdateNovelOptions,
) => {
  if (pluginId === LOCAL_PLUGIN_ID) {
    return;
  }
  const { downloadNewChapters, refreshNovelMetadata } = options;

  let novel = await fetchNovel(pluginId, novelUrl);

  if (refreshNovelMetadata) {
    updateNovelMetadata(pluginId, novelId, novel);
  }
  db.transaction(tx => {
    novel.chapters?.forEach(chapter => {
      const { name, url, releaseTime } = chapter;
      tx.executeSql(
        "INSERT INTO Chapter (url, name, releaseTime, novelId, updatedTime) values (?, ?, ?, ?, datetime('now','localtime')) ON CONFLICT(url) DO UPDATE SET name=excluded.name, releaseTime=excluded.releaseTime, novelId=excluded.novelId, updatedTime=excluded.updatedTime",
        [url, name, releaseTime || '', novelId],
        (txObj, { insertId }) => {
          if (insertId && downloadNewChapters) {
            downloadChapter(pluginId, novelId, insertId, url);
          }
        },
      );
    });
  });
};

export { updateNovel };
