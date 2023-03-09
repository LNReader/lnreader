export const createCategoriesTableQuery = `
  CREATE TABLE IF NOT EXISTS Category (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL UNIQUE,
    sort INTEGER 
  )
`;

export const createDefaultCategoryQuery =
  'INSERT OR INTO Category (name, sort) VALUES ("Default", 0)';
export const createCategoryTrigger = `
CREATE TRIGGER IF NOT EXISTS add_category AFTER INSERT ON Category 
  BEGIN
    UPDATE Category SET sort = (SELECT MAX(sort) FROM Category) + 1 WHERE id = new.id;
  END
`;
