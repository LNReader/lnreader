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
    UPDATE Category SET sort = (SELECT MAX(sort) FROM Category) + 1 WHERE id = new.id;
  END;
`;

export const createCategoryDefaultQuery =
  'INSERT OR IGNORE INTO Category (id, name, sort) VALUES (IFNULL((SELECT MAX(id) FROM Category), 1), "Default", 0)';
