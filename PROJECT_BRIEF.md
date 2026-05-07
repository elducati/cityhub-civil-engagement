# Project Brief: Civic Engagement Platform

## Problem Statement

Build a modern, scalable civic engagement platform that enables citizens to submit, discuss, and vote on community proposals. The platform must support secure authentication, transparent voting, and real-time analytics while maintaining GDPR/CCPA compliance.

---

## Environment Status

**Environment bootstrapped ✓** - All Phase 0 artifacts verified:
- Git repository initialized with branch strategy (main → develop → feature/*)
- Node.js 20.14.0 pinned via .nvmrc
- Docker Compose with postgres, redis, rabbitmq, api, web services
- CI pipeline configured (.github/workflows/ci.yml)
- Husky pre-commit/pre-push hooks active
- ESLint + Prettier configured

---

## Assumptions

1. **Authentication**: JWT-based auth with role-based access (USER, MODERATOR, ADMIN) - will use simplified implementation for MVP
2. **Database**: PostgreSQL with GIN/B-tree indexes - migrations will be SQL-based
3. **Frontend**: React + Vite for MVP (architecture supports migration to Next.js later)
4. **Backend**: Express for MVP (architecture supports migration to NestJS later)
5. **Deployment**: Docker Compose for local, Kubernetes-ready for production
6. **Scale**: MVP targets 1000 concurrent users, 10k proposals
7. **Compliance**: Basic GDPR hooks (data export/delete endpoints) - full compliance in Phase 5

---

## Top 3 Architectural Tradeoffs

### 1. Express vs NestJS
- **Decision**: Express for MVP speed
- **Tradeoff**: Less structured than NestJS, but faster to iterate
- **Mitigation**: Clear module organization (routes/services/models) enables future migration

### 2. React + Vite vs Next.js
- **Decision**: Vite for faster dev experience
- **Tradeoff**: No SSR/ISR out of the box
- **Mitigation**: Architecture supports adding Next.js layer later; SSR is not critical for MVP

### 3. Monolith vs Microservices
- **Decision**: Monolithic API for MVP
- **Tradeoff**: Single failure point, harder to scale individual services
- **Mitigation**: Clear service boundaries (identity/proposals/voting/analytics) enable future extraction

---

## Success Criteria

| # | Checkpoint | Verification |
|---|------------|--------------|
| 1 | Docker Compose boots all services without errors | `docker compose up` exits with code 0 |
| 2 | All health checks pass (postgres, redis, rabbitmq) | `docker compose ps` shows healthy |
| 3 | API responds at /api/health | curl returns 200 |
| 4 | Frontend loads at localhost:5173 | Browser renders without console errors |
| 5 | User can register and login | JWT token returned |
| 6 | User can create a proposal | Proposal saved to database |
| 7 | User can vote on a proposal | Vote count increments |
| 8 | Unit tests pass (≥80% on business logic) | `npm run test` passes |
| 9 | Lint + type-check pass | `npm run lint` + `npm run type-check` |
| 10 | CI pipeline passes on push | GitHub Actions all green |

---

## Build Plan

```
1. Initialize database schema (users, proposals, votes, audit_logs)
   → verify: psql connects, tables created

2. Implement authentication (register, login, JWT middleware)
   → verify: login returns token, protected routes require token

3. Implement proposal CRUD (create, read, update, delete)
   → verify: CRUD operations work via curl/Postman

4. Implement voting system (cast vote, vote count, vote validation)
   → verify: user cannot vote twice, vote count accurate

5. Add Redis caching (trending proposals, vote buffering)
   → verify: cache hits reduce DB load

6. Implement basic analytics (proposal stats, voting turnout)
   → verify: stats endpoint returns correct data

7. Build frontend pages (Home, Login, Register, Proposals, Create Proposal, Vote)
   → verify: all pages render, forms submit correctly

8. Add integration tests for all API endpoints
   → verify: all tests pass

9. Performance optimization (indexes, query optimization, ISR)
   → verify: load testing shows acceptable response times

10. Security hardening (rate limiting, Helmet, CORS, encryption)
    → verify: security scan passes
```

---

## Test Strategy by Layer

| Layer | Strategy | Tools |
|-------|----------|-------|
| **Service/Business Logic** | Strict TDD (Red → Green → Refactor) | Jest (backend), Vitest (frontend) |
| **API Endpoints** | Integration tests; test-after acceptable | Jest + supertest |
| **UI Components** | Component tests + E2E for critical flows | Vitest + Playwright |
| **Infrastructure** | Linting + smoke tests minimum | ESLint, Docker health checks |

**No code merges to main without corresponding test. No exceptions.**

---

## Next Steps

Proceed to **Phase 2: Architect** for system design (architecture diagram, API contracts, DB schema, UI structure).