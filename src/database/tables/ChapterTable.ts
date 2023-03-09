export const createChapterTableQuery = `
    CREATE TABLE IF NOT EXISTS Chapter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novel_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        name TEXT NOT NULL,
        release_time TEXT,
        bookmark INTEGER DEFAULT 0, 
        unread INTEGER DEFAULT 1, 
        is_downloaded INTEGER DEFAULT 0,
        FOREIGN KEY (novel_id) REFERENCES Novel(id) ON DELETE CASCADE
    )
`;
