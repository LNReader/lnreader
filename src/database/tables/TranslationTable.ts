export const createTranslationTableQuery = `
    CREATE TABLE IF NOT EXISTS Translation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapterId INTEGER NOT NULL,
        content TEXT NOT NULL,
        model TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        instruction TEXT,
        UNIQUE(chapterId),
        FOREIGN KEY (chapterId) REFERENCES Chapter(id) ON DELETE CASCADE
    )
`;
