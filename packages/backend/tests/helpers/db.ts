/**
 * Database Test Helper
 * Provides reset, seed, query, and teardown functions for integration tests
 */

import { getDatabase } from '../../src/config/database';
import { getRedisClient } from '../../src/config/redis';

const TEST_DB_NAME = process.env.TEST_DB_NAME || 'civic_test';
const TEST_DB_URL = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

export const db = {
  /**
   * Reset test database - drops and recreates all tables
   */
  async reset(): Promise<void> {
    const knex = getDatabase();
    
    const tables = await knex.raw(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
    );
    
    for (const table of tables.rows) {
      await knex.raw(`DROP TABLE IF EXISTS "${table.table_name}" CASCADE`);
    }
  },

  /**
   * Seed specific fixture data
   */
  async seed(fixture: 'users' | 'proposals' | 'votes' | 'all', data?: Record<string, unknown>): Promise<void> {
    const knex = getDatabase();
    
    switch (fixture) {
      case 'users':
        await knex('users').insert([
          { id: 'usr-001', email: 'citizen@test.civic', role: 'USER', keycloak_id: 'kc-001', is_active: true },
          { id: 'usr-002', email: 'mod@test.civic', role: 'MODERATOR', keycloak_id: 'kc-002', is_active: true },
          { id: 'usr-003', email: 'admin@test.civic', role: 'ADMIN', keycloak_id: 'kc-003', is_active: true },
          { id: 'usr-004', email: 'gone@test.civic', role: 'USER', keycloak_id: 'kc-004', is_active: false },
        ]);
        break;
        
      case 'proposals':
        await knex('proposals').insert([
          { id: 'prp-001', title: 'Fix Westlands Road', description: 'Build new road', author_id: 'usr-001', status: 'OPEN', vote_count: 42 },
          { id: 'prp-002', title: 'New Park in Kilimani', description: 'Create green space', author_id: 'usr-001', status: 'CLOSED', vote_count: 15 },
          { id: 'prp-003', title: 'Old Project', description: 'Completed project', author_id: 'usr-001', status: 'ARCHIVED', vote_count: 200 },
          { id: 'prp-004', title: 'Draft Idea', description: 'Work in progress', author_id: 'usr-001', status: 'OPEN', vote_count: 0 },
        ]);
        break;
        
      case 'votes':
        if (data?.proposalId && data?.userId) {
          await knex('votes').insert({
            proposal_id: data.proposalId,
            user_id: data.userId,
            vote_type: 'UP',
          });
        }
        break;
        
      case 'all':
        await this.seed('users');
        await this.seed('proposals');
        break;
    }
  },

  /**
   * Execute raw query for assertions (e.g., audit log check)
   */
  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T> {
    const knex = getDatabase();
    const result = await knex.raw(sql, params);
    return result.rows || result;
  },

  /**
   * Clean up test data - called in afterAll
   */
  async teardown(): Promise<void> {
    const knex = getDatabase();
    await knex.destroy();
  },

  /**
   * Flush Redis test database
   */
  async flushRedis(): Promise<void> {
    const redis = await getRedisClient();
    await redis.flushdb();
  },
};