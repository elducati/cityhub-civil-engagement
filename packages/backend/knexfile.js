require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cityhub',
      ssl: false,
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './db/knex-migrations',
      extension: 'js',
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 20 },
    migrations: {
      directory: './db/knex-migrations',
      extension: 'js',
      tableName: 'knex_migrations',
    },
  },
};
