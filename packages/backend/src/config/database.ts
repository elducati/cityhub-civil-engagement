import knex, { Knex } from 'knex';
import { config } from './index';

let db: Knex | null = null;

export function initDatabase(): Knex {
  if (db) {
    return db;
  }

  db = knex({
    client: 'pg',
    connection: {
      connectionString: config.DATABASE_URL,
      ssl: false,
    },
    pool: {
      min: 2,
      max: config.DATABASE_POOL_SIZE,
    },
    migrations: {
      directory: './db/migrations',
      extension: 'sql',
    },
  });

  return db;
}

export function getDatabase(): Knex {
  if (!db) {
    return initDatabase();
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}
