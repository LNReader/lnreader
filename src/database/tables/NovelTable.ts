import { SQLTransaction } from 'expo-sqlite';
import { txnErrorCallback } from '@database/utils/helpers';

export const createNovelTableQuery = `
  CREATE TABLE IF NOT EXISTS Novel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    pluginId TEXT NOT NULL,
    name TEXT NOT NULL,
    cover TEXT, 
    summary TEXT, 
    author TEXT, 
    artist TEXT, 
    status TEXT Default 'Unknown', 
    genres TEXT,
    rating REAL,
    inLibrary INTEGER DEFAULT 0,
    isLocal INTEGER DEFAULT 0,
    totalPages INTEGER DEFAULT 0,
    UNIQUE(path, pluginId)
  );
`;

export const addRatingColumnToTable = (tx: SQLTransaction) => {
  tx.executeSql(
    'PRAGMA table_info("Novel");',
    [],
    (tx2, resultSet) => {
      const hasRating = !!resultSet.rows._array.find(v => v.name === 'rating');
      if (!hasRating) {
        tx.executeSql('ALTER TABLE Novel ADD COLUMN rating REAL;');
      }
    },
    txnErrorCallback,
  );
};
