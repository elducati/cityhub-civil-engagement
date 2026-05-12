#!/usr/bin/env node

/**
 * Usage: npm run changelog "description of feature"
 *
 * Appends an entry to the README.md Refactoring History table.
 * Run after adding a major feature or making a significant change.
 */

const fs = require('fs');
const path = require('path');

const readmePath = path.resolve(__dirname, '..', 'README.md');
const description = process.argv.slice(2).join(' ');

if (!description) {
  console.error('Usage: npm run changelog "description of change"');
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 7).replace('T', ' '); // YYYY-MM
const entry = `| ${date} | ${description} |\n`;

const readme = fs.readFileSync(readmePath, 'utf8');
const marker = '## License';
const historyEnd = readme.lastIndexOf('| 2026-', readme.indexOf(marker));
const insertPos = readme.indexOf('\n\n', historyEnd) + 1;

if (insertPos < 2) {
  console.error('Could not find Refactoring History table end.');
  process.exit(1);
}

const updated = readme.slice(0, insertPos) + entry + readme.slice(insertPos);
fs.writeFileSync(readmePath, updated);

console.log(`✓ Added to README: ${date} — ${description}`);
