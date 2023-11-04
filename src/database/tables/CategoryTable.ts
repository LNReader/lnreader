export const createCategoriesTableQuery = `
  CREATE TABLE IF NOT EXISTS Category (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL UNIQUE,
    sort INTEGER
  );
`;

export const createCategoryTriggerQuery = `
  CREATE TRIGGER IF NOT EXISTS add_category AFTER INSERT ON Category
  BEGIN
    UPDATE Category SET sort = (SELECT IFNULL(sort, new.id)) WHERE id = new.id;
  END;
`;

export const createCategoryDefaultQuery =
  'INSERT OR IGNORE INTO Category (id, name, sort) VALUES (1, "Default", 1)';

export const createCategoryLocalQuery =
  'INSERT OR IGNORE INTO Category (id, name, sort) VALUES (2, "Local", 2)';
