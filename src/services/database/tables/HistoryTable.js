export const createHistoryTableQuery = `
    CREATE TABLE IF NOT EXISTS history(
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    history_chapter_id TEXT,
    history_last_read LONG,
    history_time_read,
    FOREIGN KEY (history_chapter_id) REFERENCES chapters(chapter_id)
    ON DELETE CASCADE
    )`;

export const createChapterIdIndexQuery = `CREATE INDEX IF NOT EXISTS history_chapter_id_index ON history(history_chapter_id)`;
