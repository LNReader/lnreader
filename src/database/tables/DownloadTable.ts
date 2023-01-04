export const createDownloadTableQuery = `
    CREATE TABLE IF NOT EXISTS downloads(
        downloadId INTEGER PRIMARY KEY AUTOINCREMENT, 
        downloadChapterId INTEGER NOT NULL, 
        chapterPrefix TEXT, 
        chapterName TEXT,
        chapterText TEXT, 
        FOREIGN KEY (downloadChapterId) REFERENCES chapters(chapterId) ON DELETE CASCADE
      )
  `;
