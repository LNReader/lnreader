import {showToast} from '../../hooks/showToast';

import {fetchNovel} from '../Source/source';
import {downloadChapter} from '../../database/queries/ChapterQueries';

import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');

const updateNovelMetadata = async (novelId, novel) => {
  const {novelName, novelCover, novelSummary, author, artist, genre, status} =
    novel;

  db.transaction(tx => {
    tx.executeSql(
      'UPDATE novels SET novelName = ?, novelCover = ?, novelSummary = ?, author = ?, artist = ?, genre = ?, status = ? WHERE novelId = ?',
      [
        novelName,
        novelCover,
        novelSummary,
        author,
        artist,
        genre,
        status,
        novelId,
      ],
      (txObj, res) => {},
      (txObj, error) => showToast(`Error: ${error}`),
    );
  });
};

const updateNovelCover = async (novelId, novel) => {
  const {novelCover} = novel;

  db.transaction(tx => {
    tx.executeSql(
      'UPDATE novels SET novelCover = ? WHERE novelId = ?',
      [novelCover, novelId],
      (txObj, res) => {},
      (txObj, error) => showToast(`Error: ${error}`),
    );
  });
};

const insertUpdate = async (tx, chapterId, novelId) =>
  tx.executeSql(
    "INSERT OR IGNORE INTO updates (chapterId, novelId, updateTime) values (?, ?, (datetime('now','localtime')))",
    [chapterId, novelId],
    (txOBJ, res) => {},
    (txOBJ, error) => {},
  );

const updateNovel = async (sourceId, novelUrl, novelId, options) => {
  const {downloadNewChapters, refreshNovelMetadata} = options;

  let novel = await fetchNovel(sourceId, novelUrl);

  if (refreshNovelMetadata) {
    updateNovelMetadata(novelId, novel);
  }

  db.transaction(tx => {
    novel.chapters.map(chapter => {
      const {chapterName, chapterUrl, releaseDate} = chapter;

      tx.executeSql(
        'INSERT OR IGNORE INTO chapters (chapterUrl, chapterName, releaseDate, novelId) values (?, ?, ?, ?)',
        [chapterUrl, chapterName, releaseDate, novelId],
        (txObj, {insertId}) => {
          if (insertId !== -1) {
            if (downloadNewChapters) {
              downloadChapter(sourceId, novelUrl, chapterUrl, insertId);
            }
            insertUpdate(tx, insertId, novelId);
          }
        },
        (txObj, error) => {},
      );
    });
  });
};

export {updateNovel};
