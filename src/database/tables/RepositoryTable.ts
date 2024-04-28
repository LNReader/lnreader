export const createRepositoryTableQuery = `
  CREATE TABLE IF NOT EXISTS Repository (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    UNIQUE(url)
  );
`;

export const insertDefaultRepository =
  'INSERT INTO Repository (url) VALUES ("https://raw.githubusercontent.com/LNReader/lnreader-plugins/plugins/v2.1.0/.dist/plugins.min.json");';
