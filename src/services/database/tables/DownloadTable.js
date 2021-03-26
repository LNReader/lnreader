const createDownloadTableQuery = `
CREATE TABLE IF NOT EXISTS downloads(
    download_id INTEGER PRIMARY KEY AUTOINCREMENT,
    download_chapter_id TEXT NOT NULL,
    chapter_text TEXT,
    next_chapter TEXT,
    previous_chapter TEXT,
    FOREIGN KEY (download_chapter_id) REFERENCES chapters(chapter_id)
    ON DELETE CASCADE
    )`;
