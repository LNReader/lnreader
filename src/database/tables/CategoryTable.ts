export const createCategoriesTableQuery = `
    CREATE TABLE IF NOT EXISTS categories(
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL,
        lastUpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        sort INTEGER DEFAULT NULL
      )
  `;

export const createDefaultCategoryQuery =
  'INSERT INTO categories (id, name) VALUES (1, "Default");';

export const createCategorydIndexQuery =
  'CREATE INDEX IF NOT EXISTS categoryIdIndex ON categories(id)';

export const addCategorySortColumnQuery =
  'ALTER TABLE categories ADD COLUMN sort INTEGER DEFAULT NULL';
