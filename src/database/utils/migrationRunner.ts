import { SQLiteDatabase } from 'expo-sqlite';
import { Migration, MigrationConfig } from '../types/migration';
import { showToast } from '@utils/showToast';

/**
 * Migration runner that handles database version upgrades
 */
export class MigrationRunner {
  private migrations: Migration[];
  private config: MigrationConfig;

  constructor(migrations: Migration[], config: MigrationConfig = {}) {
    this.migrations = [...migrations].sort((a, b) => a.version - b.version);
    this.config = {
      verbose: false,
      ...config,
    };

    this.validateMigrations();
  }

  /**
   * Validates migrations: no duplicates, positive versions, warns on non-sequential versions
   */
  private validateMigrations(): void {
    const versions = new Set<number>();

    for (const migration of this.migrations) {
      if (migration.version <= 0) {
        throw new Error(
          `Migration version must be positive: ${migration.version}`,
        );
      }

      if (versions.has(migration.version)) {
        throw new Error(
          `Duplicate migration version found: ${migration.version}`,
        );
      }

      versions.add(migration.version);
    }

    const sortedVersions = Array.from(versions).sort((a, b) => a - b);
    for (let i = 0; i < sortedVersions.length; i++) {
      if (sortedVersions[i] !== i + 1 && this.config.verbose) {
        // eslint-disable-next-line no-console
        console.warn(
          `Migration versions are not sequential. Expected ${i + 1}, found ${
            sortedVersions[i]
          }`,
        );
      }
    }
  }

  private getCurrentVersion(db: SQLiteDatabase): number {
    return (
      db.getFirstSync<{ user_version: number }>('PRAGMA user_version')
        ?.user_version ?? 0
    );
  }

  private setVersion(db: SQLiteDatabase, version: number): void {
    db.execSync(`PRAGMA user_version = ${version}`);
  }

  /**
   * Runs all pending migrations in order, each wrapped in a transaction
   * Stops on first error to prevent partial migrations
   */
  runMigrations(db: SQLiteDatabase): void {
    const currentVersion = this.getCurrentVersion(db);

    if (this.config.verbose) {
      // eslint-disable-next-line no-console
      console.log(`Current database version: ${currentVersion}`);
    }

    const pendingMigrations = this.migrations.filter(
      m => m.version > currentVersion,
    );

    if (pendingMigrations.length === 0) {
      if (this.config.verbose) {
        // eslint-disable-next-line no-console
        console.log('No pending migrations');
      }
      return;
    }

    if (this.config.verbose) {
      // eslint-disable-next-line no-console
      console.log(`Running ${pendingMigrations.length} pending migration(s)`);
    }

    for (const migration of pendingMigrations) {
      try {
        if (this.config.verbose) {
          // eslint-disable-next-line no-console
          console.log(
            `Running migration ${migration.version}${
              migration.description ? `: ${migration.description}` : ''
            }`,
          );
        }

        db.withTransactionSync(() => {
          migration.migrate(db);
          this.setVersion(db, migration.version);
        });

        if (this.config.verbose) {
          // eslint-disable-next-line no-console
          console.log(`Migration ${migration.version} completed successfully`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Migration ${migration.version} failed`;

        if (this.config.verbose) {
          // eslint-disable-next-line no-console
          console.error(`Migration ${migration.version} failed:`, error);
        }

        if (this.config.onError) {
          this.config.onError(
            error instanceof Error ? error : new Error(errorMessage),
            migration,
          );
        } else {
          showToast(`Database migration failed: ${errorMessage}`);
        }

        throw error;
      }
    }

    if (this.config.verbose) {
      const newVersion = this.getCurrentVersion(db);
      // eslint-disable-next-line no-console
      console.log(`Database updated to version ${newVersion}`);
    }
  }

  getTargetVersion(): number {
    return this.migrations.length > 0
      ? Math.max(...this.migrations.map(m => m.version))
      : 0;
  }

  getMigrations(): readonly Migration[] {
    return this.migrations;
  }
}
