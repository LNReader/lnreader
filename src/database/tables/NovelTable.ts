export const createNovelTableQuery = `
  CREATE TABLE IF NOT EXISTS Novel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    plugin_id TEXT NOT NULL,
    name TEXT NOT NULL,
    cover TEXT, 
    summary TEXT, 
    author TEXT, 
    artist TEXT, 
    status TEXT, 
    genres TEXT,
    in_libary INTEGER DEFAULT 0, 
  )
`;
