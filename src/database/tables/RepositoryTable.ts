export const createRepositoryTableQuery = `
  CREATE TABLE IF NOT EXISTS Repository (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    UNIQUE(url)
  );
`;

export const insertDefaultRepository =
  'INSERT OR REPLACE INTO Repository (id, url) VALUES (1, "https://raw.githubusercontent.com/LNReader/lnreader-plugins/plugins/v2.2.0/.dist/plugins.min.json");';
