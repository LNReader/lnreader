export const createChapterTableQuery = `
    CREATE TABLE IF NOT EXISTS chapters(
    chapter_id INTEGER  PRIMARY KEY AUTOINCREMENT,
    chapter_url TEXT,
    novel_id TEXT NOT NULL,
    name TEXT NOT NULL,
    date_upload TEXT,
    bookmark BOOLEAN NOT NULL, 
    \`read\` TEXT DEFAULT 0, 
    downloaded TEXT DEFAULT 0,
    FOREIGN KEY (novel_id) REFERENCES novels(novel_id),
    )`;

export const createNovelIdIndexQuery = `CREATE INDEX IF NOT EXISTS chapter_novel_id_index ON chapters(novel_id)`;

export const createUnreadChaptersIndexQuery = `CREATE INDEX IF NOT EXISTS chapter_unread_by_novel_index ON chapters(novel_id, \`read\`)`;
