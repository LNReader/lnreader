import { noop, xor } from 'lodash';

import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');

import { txnErrorCallback } from '../utils/helpers';
import { LibraryNovelInfo } from '../types';
import { fetchNovel } from '../../services/Source/source';
import { showToast } from '@hooks/showToast';
import { getString } from '@strings/translations';
import { checkNovelInCache } from './NovelQueries';

export const getCategoryNovelsFromDb = async (
  categoryId: number,
  onlyOngoingNovels?: boolean,
): Promise<LibraryNovelInfo[]> => {
  let query = `
  SELECT 
    * 
  FROM 
    novels 
  WHERE 
      categoryIds LIKE '[${categoryId}]' 
    OR 
      categoryIds LIKE '[${categoryId},%' 
    OR 
      categoryIds LIKE '%,${categoryId}]' 
    OR 
      categoryIds LIKE '%,${categoryId},%'
  `;

  if (onlyOngoingNovels) {
    query += ' AND status NOT LIKE "Completed"';
  }

  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        undefined,
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    });
  });
};

export const resetCategoryIdsToDefault = async (deletedCategoryId: number) => {
  const categoryNovels = await getCategoryNovelsFromDb(deletedCategoryId);

  db.transaction(tx => {
    categoryNovels.forEach(novel => {
      let categoryIds = xor(JSON.parse(novel.categoryIds), [deletedCategoryId]);

      categoryIds = categoryIds.length ? categoryIds : [1];

      tx.executeSql('UPDATE novels SET categoryIds = ? WHERE novelId = ?', [
        JSON.stringify(categoryIds),
        novel.novelId,
      ]);
    });
  });
};

export const insertNovelInLibrary = async (
  sourceId: number,
  novelUrl: string,
  inLibrary: boolean,
) => {
  showToast(getString('browseScreen.removeFromLibrary'));

  if (inLibrary) {
    db.transaction(tx => {
      tx.executeSql(
        `
      UPDATE novels SET
        followed = 0
      WHERE 
        sourceId = ?
      AND
        novelUrl = ?
      `,
        [sourceId, novelUrl],
        noop,
        txnErrorCallback,
      );
    });
  } else {
    showToast(getString('browseScreen.addedToLibrary'));

    const novelSavedInDb = await checkNovelInCache(novelUrl);

    if (novelSavedInDb) {
      db.transaction(tx => {
        tx.executeSql(
          `
        UPDATE novels SET
          followed = 1
        WHERE 
          sourceId = ?
        AND
          novelUrl = ?
        `,
          [sourceId, novelUrl],
          noop,
          txnErrorCallback,
        );
      });

      return;
    }

    const novel = await fetchNovel(sourceId, novelUrl);

    db.transaction(tx => {
      tx.executeSql(
        `
      INSERT INTO novels 
        (
          novelUrl, 
          sourceUrl, 
          sourceId, 
          source, 
          novelName, 
          novelCover, 
          novelSummary, 
          author, 
          artist, 
          status, 
          genre, 
          followed 
        ) 
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
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
        ],
        (txObj, { insertId }) => {
          novel.chapters?.map(chapter => {
            tx.executeSql(
              `
          INSERT INTO chapters 
            (chapterUrl, chapterName, releaseDate, novelId) 
          VALUES 
            (?, ?, ?, ?)`,
              [
                chapter.chapterUrl,
                chapter.chapterName,
                chapter.releaseDate,
                insertId,
              ],
            );
          });
        },
        txnErrorCallback,
      );
    });
  }
};
