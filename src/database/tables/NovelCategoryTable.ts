export const createNovelCategoryTableQuery = `
  CREATE TABLE IF NOT EXISTS NovelCategory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    novel_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    UNIQUE(novel_id, category_id),
    FOREIGN KEY (novel_id) REFERENCES Novel(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Category(id) ON DELETE CASCADE
  )
`;
