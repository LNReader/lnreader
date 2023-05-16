import * as SQLite from 'expo-sqlite';
import { Chapter, ExtendedChapter, Novel } from '../types';
import { txnErrorCallback } from '../utils/helpers';
import { parseChapterNumber } from '@utils/parseChapterNumber';

const db = SQLite.openDatabase('lnreader.db');

export const getExtendedChapterByChapter = (
  chapter: Chapter,
): Promise<ExtendedChapter> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Novel WHERE id = ?',
        [chapter.novelId],
        (txObj, { rows }) => {
          const novel = rows.item(0) as Novel;
          resolve({
            ...chapter,
            novel: novel,
            chapterNumber: parseChapterNumber(novel.name, chapter.name),
          } as ExtendedChapter);
        },
        txnErrorCallback,
      );
    });
  });
};

export const getExtendedChaptersByNovel = (
  novel: Novel,
): Promise<ExtendedChapter[]> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Chapter WHERE novelId = ?',
        [novel.id],
        (txObj, { rows }) => {
          resolve(
            rows._array.map(chapter => {
              return {
                ...chapter,
                novel: novel,
                chapterNumber: parseChapterNumber(novel.name, chapter.name),
              } as ExtendedChapter;
            }),
          );
        },
        txnErrorCallback,
      );
    });
  });
};
