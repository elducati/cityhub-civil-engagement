import knex, { Knex } from 'knex';
import { config } from './index';

let db: Knex | null = null;

export function initDatabase(): Knex {
  if (db) {
    return db;
  }

  const dbUrl = new URL(config.DATABASE_URL);
  db = knex({
    client: 'pg',
    connection: {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port, 10),
      database: dbUrl.pathname.slice(1),
      user: dbUrl.username,
      password: dbUrl.password,
      ssl: config.DATABASE_SSL,
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
