import type { Knex } from 'knex';
import { config } from './src/config';

const knexConfig: Record<string, Knex.Config> = {
  development: {
    client: 'pg',
    connection: {
      connectionString: config.DATABASE_URL,
      ssl: false,
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './db/knex-migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
  },
  test: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL_TEST || config.DATABASE_URL,
      ssl: false,
    },
    migrations: {
      directory: './db/knex-migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: config.DATABASE_URL,
      ssl: true,
    },
    pool: { min: 2, max: 20 },
    migrations: {
      directory: './db/knex-migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
  },
};

export default knexConfig;
