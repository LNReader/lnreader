export const createHistoryTableQuery = `
    CREATE TABLE IF NOT EXISTS History(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id INTEGER NOT NULL UNIQUE,
        read_time TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chapter_id) REFERENCES Chapter(id) ON DELETE CASCADE
    )
`;
