import { fetchImage, fetchNovel, fetchPage } from '../plugin/fetch';
import { downloadChapter } from '../../database/queries/ChapterQueries';

import * as SQLite from 'expo-sqlite';
import { ChapterItem, SourceNovel } from '@plugins/types';
import { LOCAL_PLUGIN_ID } from '@plugins/pluginManager';
import { NovelDownloadFolder } from '@utils/constants/download';
import * as RNFS from 'react-native-fs';
const db = SQLite.openDatabase('lnreader.db');

const updateNovelMetadata = (
  pluginId: string,
  novelId: number,
  novel: SourceNovel,
) => {
  return new Promise(async (resolve, reject) => {
    let { name, cover, summary, author, artist, genres, status, totalPages } =
      novel;
    const novelDir = NovelDownloadFolder + '/' + pluginId + '/' + novelId;
    if (!(await RNFS.exists(novelDir))) {
      await RNFS.mkdir(novelDir);
    }
    if (cover) {
      const novelCoverUri = 'file://' + novelDir + '/cover.png';
      await fetchImage(pluginId, cover)
        .then(base64 => {
          if (base64) {
            cover = novelCoverUri;
            return RNFS.writeFile(novelCoverUri, base64, 'base64');
          }
        })
        .catch(reject);
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
        () => resolve(null),
        (txObj, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

const updateNovelTotalPages = (novelId: number, totalPages: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE SET Novel totalPages = ? WHERE id = ?',
        [totalPages, novelId],
        () => resolve(null),
        (txObj, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

const updateNovelChapters = (
  pluginId: string,
  novelId: number,
  chapters: ChapterItem[],
  downloadNewChapters?: boolean,
  page?: string,
) => {
  return new Promise((resolve, reject) => {
    db.transaction(async tx => {
      for (let position = 0; position < chapters.length; position++) {
        const { name, path, releaseTime, chapterNumber } = chapters[position];
        tx.executeSql(
          `
            INSERT INTO Chapter (path, name, releaseTime, novelId, updatedTime, chapterNumber, page, position)
            SELECT ?, ?, ?, ?, datetime('now','localtime'), ?, ?, ?
            WHERE NOT EXISTS (SELECT id FROM Chapter WHERE path = ? AND novelId = ?);
          `,
          [
            path,
            name,
            releaseTime || null,
            novelId,
            chapterNumber || null,
            page || '1',
            position,
            path,
            novelId,
          ],
          (txObj, { insertId }) => {
            if (insertId && insertId >= 0) {
              if (downloadNewChapters) {
                downloadChapter(pluginId, novelId, insertId, path).catch(
                  reject,
                );
              }
            } else {
              tx.executeSql(
                `
                  UPDATE Chapter SET 
                    name = ?, releaseTime = ?, updatedTime = datetime('now','localtime'), page = ?, position = ?
                  WHERE path = ? AND novelId = ? AND (name != ? OR releaseTime != ? OR page != ? OR position != ?);
                `,
                [
                  name,
                  releaseTime || null,
                  page || '1',
                  position,
                  path,
                  novelId,
                  name,
                  releaseTime || null,
                  page || '1',
                  position,
                ],
                undefined,
                (txObj, error) => {
                  reject(error);
                  return false;
                },
              );
            }
          },
          (txObj, error) => {
            reject(error);
            return false;
          },
        );
      }
      resolve(null);
    });
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
    await updateNovelMetadata(pluginId, novelId, novel);
  } else if (novel.totalPages) {
    // at least update totalPages,
    await updateNovelTotalPages(novelId, novel.totalPages);
  }
  await updateNovelChapters(
    pluginId,
    novelId,
    novel.chapters || [],
    downloadNewChapters,
  );
};

const updateNovelPage = async (
  pluginId: string,
  novelPath: string,
  novelId: number,
  page: string,
  options: Pick<UpdateNovelOptions, 'downloadNewChapters'>,
) => {
  const { downloadNewChapters } = options;
  const sourcePage = await fetchPage(pluginId, novelPath, page);
  await updateNovelChapters(
    pluginId,
    novelId,
    sourcePage.chapters || [],
    downloadNewChapters,
    page,
  );
};

export { updateNovel, updateNovelPage };
