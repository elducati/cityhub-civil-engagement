/**
 * Frontend Test Fixtures
 * Mirrors backend fixtures for consistent E2E testing
 */

export const fixtures = {
  users: {
    citizen: { 
      id: 'usr-001', 
      email: 'citizen@test.civic', 
      role: 'USER' as const,
    },
    moderator: { 
      id: 'usr-002', 
      email: 'mod@test.civic', 
      role: 'MODERATOR' as const,
    },
    admin: { 
      id: 'usr-003', 
      email: 'admin@test.civic', 
      role: 'ADMIN' as const,
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
  },
} as const;