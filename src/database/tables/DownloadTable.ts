export const createDownloadTableQuery = `
  CREATE TABLE IF NOT EXISTS Download (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      chapter_id INTEGER NOT NULL, 
      chapter_text TEXT, 
      update_time TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapter_id) REFERENCES Chapter(id) ON DELETE CASCADE
  )
`;
