export const createRepositoryTableQuery = `
  CREATE TABLE IF NOT EXISTS Repository (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    UNIQUE(url)
  );
`;
