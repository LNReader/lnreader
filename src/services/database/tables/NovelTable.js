const createNovelTableQuery = `
    CREATE TABLE IF NOT EXISTS novels(
    novel_id INTEGER  PRIMARY KEY AUTOINCREMENT,
    novel_url TEXT NOT NULL,
    source TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL, 
    name TEXT NOT NULL,
    cover TEXT NOT NULL, 
    summary TEXT, 
    author TEXT, 
    artist TEXT, 
    status TEXT, 
    genre TEXT, 
    followed INTEGER DEFAULT 0, 
    unread INTEGER DEFAULT 1, 
    )`;
