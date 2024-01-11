import { fetchNovel } from '../plugin/fetch';
import { downloadChapter } from '../../database/queries/ChapterQueries';

import * as SQLite from 'expo-sqlite';
import { SourceNovel } from '@plugins/types';
import { LOCAL_PLUGIN_ID } from '@plugins/pluginManager';
const db = SQLite.openDatabase('lnreader.db');

const updateNovelMetadata = async (novelId: number, novel: SourceNovel) => {
  const { name, cover, summary, author, artist, genres, status } = novel;

  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Novel SET name = ?, cover = ?, summary = ?, author = ?, artist = ?, genres = ?, status = ? WHERE id = ?',
      [
        name,
        cover || '',
        summary || ' ',
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
    updateNovelMetadata(novelId, novel);
  }
  db.transaction(tx => {
    novel.chapters?.forEach(chapter => {
      const { name, url, releaseTime } = chapter;
      tx.executeSql(
        "INSERT OR IGNORE INTO Chapter (url, name, releaseTime, novelId, updatedTime) values (?, ?, ?, ?, datetime('now','localtime'))",
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
