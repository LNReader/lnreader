export const createChapterTableQuery = `
    CREATE TABLE IF NOT EXISTS chapters(
    chapterId INTEGER PRIMARY KEY AUTOINCREMENT,
    chapterUrl TEXT,
    novelId INTEGER NOT NULL,
    chapterName TEXT NOT NULL,
    releaseDate TEXT,
    bookmark BOOLEAN NOT NULL DEFAULT 0, 
    \`read\` INTEGER NOT NULL DEFAULT 0, 
    downloaded INTEGER NOT NULL DEFAULT 0,
    UNIQUE(novelId, chapterUrl),
    FOREIGN KEY (novelId) REFERENCES novels(novelId)
    ON DELETE CASCADE
    )`;

export const createNovelIdIndexQuery = `CREATE INDEX IF NOT EXISTS chapterNovelIdIndex ON chapters(novelId)`;

export const createUnreadChaptersIndexQuery = `CREATE INDEX IF NOT EXISTS chapterUnreadByNovelIndex ON chapters(novelId, \`read\`) WHERE \`read\`=0`;
