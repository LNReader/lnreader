export const createCategoriesTableQuery = `
  CREATE TABLE IF NOT EXISTS Category (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL,
    sort INTEGER AUTOINCREMENT
  )
`;

export const createDefaultCategoryQuery =
  'INSERT INTO Category (id, name) VALUES (1, "Default");';
