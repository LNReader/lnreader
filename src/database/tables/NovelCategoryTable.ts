export const createNovelCategoryTableQuery = `
  CREATE TABLE IF NOT EXISTS NovelCategory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    novelId INTEGER NOT NULL,
    categoryId INTEGER NOT NULL,
    UNIQUE(novelId, categoryId),
    FOREIGN KEY (novelId) REFERENCES Novel(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE
  );
`;
