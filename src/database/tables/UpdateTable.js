export const createUpdatesTableQuery = `
    CREATE TABLE IF NOT EXISTS updates(
    updateId INTEGER PRIMARY KEY AUTOINCREMENT,
    chapterId INTEGER NOT NULL,
    novelId INTEGER NOT NULL,
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(novelId, chapterId),
    FOREIGN KEY (chapterId) REFERENCES chapters(chapterId),
    FOREIGN KEY (novelId) REFERENCES novels(novelId)
    ON DELETE CASCADE
    )`;
