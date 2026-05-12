const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

const migrationsDir = path.resolve(__dirname, '../db/migrations');
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cityhub';
const tableName = '_migrations';

async function runMigrations() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS "${tableName}" (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `);

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    await client.end();
    return;
  }

  const { rows: applied } = await client.query(`SELECT name FROM "${tableName}"`);
  const appliedNames = new Set(applied.map(r => r.name));

  for (const file of files) {
    if (appliedNames.has(file)) {
      console.log(`  SKIP ${file} (already applied)`);
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Applying: ${file}...`);

    try {
      await client.query(sql);
      await client.query(`INSERT INTO "${tableName}" (name) VALUES ($1)`, [file]);
      console.log(`  ✓ ${file}`);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already exists')) {
        console.log(`  SKIP ${file} (already exists)`);
        await client.query(`INSERT INTO "${tableName}" (name) VALUES ($1)`, [file]).catch(() => {});
      } else if (msg.includes('duplicate key')) {
        console.log(`  SKIP ${file} (already applied)`);
      } else {
        await client.query('ROLLBACK');
        console.error(`  ✗ ${file}: ${err.message}`);
        await client.end();
        process.exit(1);
      }
    }
  }

  console.log(`\nAll ${files.length} migrations processed.`);
  await client.end();
}

runMigrations();
