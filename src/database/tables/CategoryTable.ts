export const createCategoriesTableQuery = `
  CREATE TABLE IF NOT EXISTS Category (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL,
    last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
    sort INTEGER DEFAULT NULL
  )
`;

export const createDefaultCategoryQuery =
  'INSERT INTO Category (id, name) VALUES (1, "Default");';
