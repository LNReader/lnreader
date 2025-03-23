export const createNovelTableQuery = `
  CREATE TABLE IF NOT EXISTS Novel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    pluginId TEXT NOT NULL,
    name TEXT NOT NULL,
    cover TEXT, 
    summary TEXT, 
    author TEXT, 
    artist TEXT, 
    status TEXT Default 'Unknown', 
    genres TEXT,
    inLibrary INTEGER DEFAULT 0,
    isLocal INTEGER DEFAULT 0,
    totalPages INTEGER DEFAULT 0,
    chaptersDownloaded INTEGER DEFAULT 0,
    chaptersRead INTEGER DEFAULT 0,
    totalChapters INTEGER DEFAULT 0
    lastReadAt TEXT,
    lastUpdatedAt TEXT
    UNIQUE(path, pluginId)
  );
`;

export const createNovelIndexQuery = `
    CREATE INDEX
    IF NOT EXISTS
    NovelIndex ON Novel(pluginId, path, id, inLibrary);
`;

export const dropNovelIndexQuery = `
    DROP INDEX IF EXISTS NovelIndex;
`;

export const createNovelTriggerQueryInsert = `CREATE TRIGGER IF NOT EXISTS update_novel_stats 
AFTER INSERT ON Chapter
BEGIN
    UPDATE Novel
    SET 
        totalChapters = (SELECT COUNT(*) FROM Chapter WHERE Chapter.novelId = Novel.id),
        lastUpdatedAt = (SELECT MAX(updatedTime) FROM Chapter WHERE Chapter.novelId = Novel.id)
    WHERE id = NEW.novelId;
END;

`;
export const createNovelTriggerQueryUpdate = `CREATE TRIGGER IF NOT EXISTS update_novel_stats_on_update 
AFTER UPDATE ON Chapter
BEGIN
    UPDATE Novel
    SET 
        chaptersDownloaded = (SELECT COUNT(*) FROM Chapter WHERE Chapter.novelId = Novel.id AND Chapter.isDownloaded = 1),
        chaptersRead = (SELECT COUNT(*) FROM Chapter WHERE Chapter.novelId = Novel.id AND Chapter.unread = 0),
        lastReadAt = (SELECT MAX(readTime) FROM Chapter WHERE Chapter.novelId = Novel.id),
        lastUpdatedAt = (SELECT MAX(updatedTime) FROM Chapter WHERE Chapter.novelId = Novel.id)
    WHERE id = NEW.novelId;
END;
`;
export const createNovelTriggerQueryDelete = `CREATE TRIGGER IF NOT EXISTS update_novel_stats_on_delete 
AFTER DELETE ON Chapter
BEGIN
    UPDATE Novel
    SET 
        chaptersDownloaded = (SELECT COUNT(*) FROM Chapter WHERE Chapter.novelId = Novel.id AND Chapter.isDownloaded = 1),
        chaptersRead = (SELECT COUNT(*) FROM Chapter WHERE Chapter.novelId = Novel.id AND Chapter.unread = 0),
        totalChapters = (SELECT COUNT(*) FROM Chapter WHERE Chapter.novelId = Novel.id),
        lastReadAt = (SELECT MAX(readTime) FROM Chapter WHERE Chapter.novelId = Novel.id),
        lastUpdatedAt = (SELECT MAX(updatedTime) FROM Chapter WHERE Chapter.novelId = Novel.id)
    WHERE id = OLD.novelId;
END;
`;
