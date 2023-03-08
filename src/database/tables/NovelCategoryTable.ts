export const createNovelCategoryTableQuery = `
  CREATE TABLE IF NOT EXISTS NovelCategory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    novel_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (novel_id) REFERENCES Novel(id),
    FOREIGN KEY (category_id) REFERENCES Category(id) ON DELETE CASCADE,
  )
`;
