import * as SQLite from 'expo-sqlite';
import {showToast} from '../../hooks/showToast';
import {DownloadedChapter} from '../types';

const db = SQLite.openDatabase('lnreader.db');

const getChapterFromDbQuery = `
    SELECT 
      * 
    FROM 
      downloads 
    WHERE 
      downloadChapterId = ?
`;

export const getChapterFromDb = async (
  chapterId: number,
): Promise<DownloadedChapter> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getChapterFromDbQuery,
        [chapterId],
        (txObj, results) => resolve(results.rows.item(0)),
        (txObj, error) => {
          showToast(error.message);
          return true;
        },
      );
    }),
  );
};
