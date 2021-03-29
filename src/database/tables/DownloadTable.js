export const createDownloadTableQuery = `
    CREATE TABLE IF NOT EXISTS downloads(
    downloadId INTEGER PRIMARY KEY AUTOINCREMENT,
    downloadChapterId INTEGER NOT NULL,
    chapterName TEXT,
    chapterText TEXT,
    nextChapter TEXT,
    prevChapter TEXT,
    FOREIGN KEY (downloadChapterId) REFERENCES chapters(chapter_id)
    ON DELETE CASCADE
    )`;
