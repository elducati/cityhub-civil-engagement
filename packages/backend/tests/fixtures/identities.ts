/**
 * Test Fixtures - Fixed identity set for consistent, predictable tests
 * Prevents combinatorial test data sprawl
 */

import { generateTestToken } from '../helpers/jwt';

export const fixtures = {
  users: {
    citizen: { 
      id: 'usr-001', 
      email: 'citizen@test.civic', 
      role: 'USER' as const,
      keycloakId: 'kc-001' 
    },
    moderator: { 
      id: 'usr-002', 
      email: 'mod@test.civic', 
      role: 'MODERATOR' as const,
      keycloakId: 'kc-002' 
    },
    admin: { 
      id: 'usr-003', 
      email: 'admin@test.civic', 
      role: 'ADMIN' as const,
      keycloakId: 'kc-003' 
    },
    inactive: { 
      id: 'usr-004', 
      email: 'gone@test.civic', 
      role: 'USER' as const,
      is_active: false 
    },
  },
  proposals: {
    open: { 
      id: 'prp-001', 
      title: 'Fix Westlands Road', 
      status: 'OPEN' as const, 
      authorId: 'usr-001', 
      voteCount: 42 
    },
    closed: { 
      id: 'prp-002', 
      title: 'New Park in Kilimani', 
      status: 'CLOSED' as const, 
      authorId: 'usr-001', 
      voteCount: 15 
    },
    archived: { 
      id: 'prp-003', 
      title: 'Old Project', 
      status: 'ARCHIVED' as const, 
      authorId: 'usr-001', 
      voteCount: 200 
    },
    draft: { 
      id: 'prp-004', 
      title: 'Draft Idea', 
      status: 'OPEN' as const, 
      authorId: 'usr-001', 
      voteCount: 0 
    },
  },
  tokens: {
    citizen: () => generateTestToken(fixtures.users.citizen),
    moderator: () => generateTestToken(fixtures.users.moderator),
    admin: () => generateTestToken(fixtures.users.admin),
    expired: () => generateTestToken(fixtures.users.citizen, { expiresIn: '-1s' }),
    wrongKey: () => generateTestToken(fixtures.users.citizen, { secret: 'wrong-secret-key-minimum-32-chars-required' }),
    forgedRole: () => generateTestToken({ ...fixtures.users.citizen, role: 'ADMIN' }),
  },
} as const;

export type FixtureUser = typeof fixtures.users.citizen;
export type FixtureProposal = typeof fixtures.proposals.open;