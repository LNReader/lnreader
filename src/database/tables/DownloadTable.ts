export const createDownloadTableQuery = `
  CREATE TABLE IF NOT EXISTS Download (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      chapterId INTEGER NOT NULL UNIQUE, 
      chapterText TEXT, 
      updateTime TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapterId) REFERENCES Chapter(id) ON DELETE CASCADE
  )
`;
