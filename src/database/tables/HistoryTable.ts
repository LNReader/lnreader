export const createHistoryTableQuery = `
    CREATE TABLE IF NOT EXISTS History(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapterId INTEGER NOT NULL UNIQUE,
        readTime TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chapterId) REFERENCES Chapter(id) ON DELETE CASCADE
    )
`;
