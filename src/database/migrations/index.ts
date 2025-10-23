import { Migration } from '../types/migration';
import { migration001 } from './001_add_novel_counters';

/**
 * Registry of all database migrations
 *
 * To add a new migration:
 * 1. Create a new file (e.g., 002_add_bookmarks.ts)
 * 2. Define your migration (see existing migrations for examples)
 * 3. Import and add it to the migrations array below
 * 4. Ensure version numbers are sequential
 */
export const migrations: Migration[] = [migration001];
