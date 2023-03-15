import { showToast } from '../../hooks/showToast';

import { fetchNovel } from '../plugin/fetch';
import { downloadChapter } from '../../database/queries/ChapterQueries';

import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');

const updateNovelMetadata = async (novelId, novel) => {
  const { name, cover, summary, author, artist, genres, status } = novel;

  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Novel SET name = ?, cover = ?, summary = ?, author = ?, artist = ?, genres = ?, status = ? WHERE id = ?',
      [
        name,
        cover,
        summary || ' ',
        author,
        artist,
        genres || '',
        status,
        novelId,
      ],
      (txObj, res) => {},
      (txObj, error) => showToast(`Error: ${error}`),
    );
  });
};

const updateNovelCover = async (novelId, novel) => {
  const { cover } = novel;

  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Novel SET cover = ? WHERE id = ?',
      [cover, novelId],
      (txObj, res) => {},
      (txObj, error) => showToast(`Error: ${error}`),
    );
  });
};

const insertUpdate = async (tx, chapterId, novelId) =>
  tx.executeSql(
    "INSERT OR IGNORE INTO updates (chapterId, updateTime) values (?, (datetime('now','localtime')))",
    [chapterId, novelId],
    (txOBJ, res) => {},
    (txOBJ, error) => {},
  );

const updateNovel = async (pluginId, novelUrl, novelId, options) => {
  const { downloadNewChapters, refreshNovelMetadata } = options;

  let novel = await fetchNovel(pluginId, novelUrl);

  if (refreshNovelMetadata) {
    updateNovelMetadata(novelId, novel);
  }

  db.transaction(tx => {
    novel.chapters.map(chapter => {
      const { name, url, releaseTime } = chapter;

      tx.executeSql(
        'INSERT OR IGNORE INTO chapters (url, name, releaseTime, novelId) values (?, ?, ?, ?)',
        [url, chapterName, releaseTime, id],
        (txObj, { insertId }) => {
          if (insertId !== -1) {
            if (downloadNewChapters) {
              downloadChapter(pluginId, id, chapterUrl, url);
            }
            insertUpdate(tx, insertId, novelId);
          }
        },
        (txObj, error) => {},
      );
    });
  });
};

export { updateNovel };
