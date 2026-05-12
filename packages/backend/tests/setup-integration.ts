/**
 * Integration Test Setup
 * Runs before each integration test file
 */

import { db } from './helpers/db';

beforeAll(async () => {
  // Reset database before integration tests
  await db.reset();
  await db.seed('all');
  
  // Flush Redis
  try {
    await db.flushRedis();
  } catch (e) {
    // Redis might not be available in all test environments
  }
}, 30000);

afterAll(async () => {
  await db.teardown();
}, 10000);

beforeEach(async () => {
  // Clean up votes table before each test
  try {
    const knex = require('../src/config/database').getDatabase();
    await knex('votes').del();
    await knex('proposals').update('vote_count', 0);
  } catch (e) {
    // Table might not exist yet
  }
});