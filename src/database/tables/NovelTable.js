export const createNovelTableQuery = `
    CREATE TABLE IF NOT EXISTS novels(
    novelId INTEGER PRIMARY KEY AUTOINCREMENT,
    novelUrl TEXT NOT NULL,
    sourceUrl TEXT UNIQUE NOT NULL,
    sourceId INTEGER NOT NULL,
    source TEXT NOT NULL,
    novelName TEXT NOT NULL,
    novelCover TEXT, 
    novelSummary TEXT, 
    author TEXT, 
    artist TEXT, 
    status TEXT, 
    genre TEXT, 
    followed INTEGER DEFAULT 0, 
    unread INTEGER DEFAULT 1
    )`;

export const createUrlIndexQuery =
  'CREATE INDEX IF NOT EXISTS novelUrlIndex ON novels(novelUrl)';

export const createLibraryIndexQuery =
  'CREATE INDEX IF NOT EXISTS novelFollowedIndex ON novels(followed)';
