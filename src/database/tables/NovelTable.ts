export const createNovelTableQuery = `
  CREATE TABLE IF NOT EXISTS Novel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL UNIQUE,
    pluginId TEXT NOT NULL,
    name TEXT NOT NULL,
    cover TEXT, 
    summary TEXT, 
    author TEXT, 
    artist TEXT, 
    status TEXT Default 'Unknown', 
    genres TEXT,
    inLibrary INTEGER DEFAULT 0,
    isLocal INTERGER DEFAULT 0
  );
`;
