export const createChapterTableQuery = `
    CREATE TABLE IF NOT EXISTS Chapter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novelId INTEGER NOT NULL,
        url TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        releaseTime TEXT,
        bookmark INTEGER DEFAULT 0, 
        unread INTEGER DEFAULT 1, 
        isDownloaded INTEGER DEFAULT 0,
        FOREIGN KEY (novelId) REFERENCES Novel(id) ON DELETE CASCADE
    )
`;
