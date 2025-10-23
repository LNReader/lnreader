import { SQLiteDatabase } from 'expo-sqlite';

/**
 * Represents a single database migration
 */
export interface Migration {
  /**
   * The version number this migration upgrades to
   * Must be unique and sequential (1, 2, 3, etc.)
   */
  version: number;

  /**
   * Optional description of what this migration does
   */
  description?: string;

  /**
   * The migration function that performs the database changes
   * Should be idempotent and handle errors gracefully
   */
  migrate: (db: SQLiteDatabase) => void;
}

/**
 * Configuration for the migration runner
 */
export interface MigrationConfig {
  /**
   * Whether to show migration logs
   */
  verbose?: boolean;

  /**
   * Custom error handler for migrations
   */
  onError?: (error: Error, migration: Migration) => void;
}
