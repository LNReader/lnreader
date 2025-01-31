import { SQLTransaction } from 'expo-sqlite';
import { txnErrorCallback } from '@database/utils/helpers';

export const createChapterTableQuery = `
    CREATE TABLE IF NOT EXISTS Chapter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novelId INTEGER NOT NULL,
        path TEXT NOT NULL,
        name TEXT NOT NULL,
        releaseTime TEXT,
        bookmark INTEGER DEFAULT 0, 
        unread INTEGER DEFAULT 1,
        readTime TEXT,
        isDownloaded INTEGER DEFAULT 0,
        updatedTime TEXT,
        chapterNumber REAL NULL,
        page TEXT DEFAULT "1",
        position INTEGER DEFAULT 0,
        progress INTEGER,
        hidden INTEGER DEFAULT 0,
        UNIQUE(path, novelId),
        FOREIGN KEY (novelId) REFERENCES Novel(id) ON DELETE CASCADE
    )
`;

export const addHiddenColumnToTable = (tx: SQLTransaction) => {
  tx.executeSql(
    'PRAGMA table_info("Chapter");',
    [],
    (tx2, resultSet) => {
      const hasSortContents = !!resultSet.rows._array.find(
        v => v.name === 'hidden',
      );
      if (!hasSortContents) {
        tx.executeSql(
          'ALTER TABLE Chapter ADD COLUMN hidden INTEGER DEFAULT 0;',
        );
      }
    },
    txnErrorCallback,
  );
};

export const createChapterNovelIdIndexQuery = `
    CREATE INDEX
    IF NOT EXISTS
    chapterNovelIdIndex ON Chapter(novelId)
`;
