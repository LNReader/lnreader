# Database Migrations

Structured system for managing database schema changes in LNReader.

## Adding a New Migration

### Step 1: Create Migration File

Create `XXX_descriptive_name.ts` where XXX is the version number:

```typescript
import { Migration } from '../types/migration';

export const migration002: Migration = {
  version: 2,
  description: 'Add bookmarks table',
  migrate: db => {
    db.runSync(`
      CREATE TABLE IF NOT EXISTS Bookmark (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novelId INTEGER NOT NULL,
        chapterId INTEGER NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (novelId) REFERENCES Novel(id) ON DELETE CASCADE
      )
    `);

    db.runSync(`
      CREATE INDEX IF NOT EXISTS idx_bookmark_novel 
      ON Bookmark(novelId)
    `);
  },
};
```

### Step 2: Register Migration

Add to `migrations/index.ts`:

```typescript
import { migration001 } from './001_add_novel_counters';
import { migration002 } from './002_add_bookmarks'; // Add import

export const migrations: Migration[] = [
  migration001,
  migration002, // Add here
];
```

### Step 3: Done

Migration runs automatically on next app launch.

## Additional Resources

- [SQLite ALTER TABLE](https://www.sqlite.org/lang_altertable.html)
- [SQLite PRAGMA](https://www.sqlite.org/pragma.html)
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
