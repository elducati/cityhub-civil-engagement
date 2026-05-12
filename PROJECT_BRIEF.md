# Project Brief: Civic Engagement Platform

## Problem Statement

Build a modern, scalable civic engagement platform that enables citizens to submit, discuss, and vote on community proposals. The platform must support secure authentication, transparent voting, real-time analytics, and administrative moderation while maintaining audit compliance.

---

## Current Status

**Platform operational** — Docker Compose stack with 8 services:

- ✅ PostgreSQL 16 (primary + test instances)
- ✅ Redis 7 (cache + rate limiting)
- ✅ RabbitMQ 3.13 (async messaging)
- ✅ Express API (layered architecture with TypeScript)
- ✅ Next.js 14 frontend (App Router + SSR/ISR)
- ✅ Admin dashboard (stats, user management, moderation, audit logs)
- ✅ CI pipeline via GitHub Actions

---

## Architecture Decisions

### 1. Express over NestJS (for now)
- **Decision**: Express for velocity
- **Tradeoff**: Less structure than NestJS
- **Mitigation**: Clear module boundaries (routes/services/repositories) enable future migration

### 2. Next.js over Vite
- **Decision**: Next.js 14 App Router
- **Reason**: SSR for proposals listing, ISR readiness, built-in API rewrites
- **Tradeoff**: Heavier dev build times
- **Mitigation**: Docker-based dev with cached layers

### 3. Monolith over Microservices
- **Decision**: Monolithic API
- **Tradeoff**: Single deployment unit
- **Mitigation**: Service boundaries (auth/proposals/voting/admin/analytics) enable future extraction

### 4. TanStack Query for Server State
- **Decision**: React Query over Redux/context
- **Reason**: Built-in caching, background refetch, mutation invalidation
- **Mitigation**: Zustand for UI-only state (sidebar, modals, notifications)

---

## Success Criteria

| # | Checkpoint | Status |
|---|------------|--------|
| 1 | Docker Compose boots all services without errors | ✅ Verified |
| 2 | All health checks pass (postgres, redis, rabbitmq) | ✅ Verified |
| 3 | API responds at /api/health | ✅ Verified |
| 4 | Frontend loads at localhost:5173 | ✅ Verified |
| 5 | User can register and login | ✅ Verified |
| 6 | User can create a proposal | ✅ Verified |
| 7 | User can vote on a proposal | ✅ Verified |
| 8 | Admin can view dashboard stats | ✅ Verified |
| 9 | Admin can manage user roles | ✅ Verified |
| 10 | Admin can moderate proposals (approve/reject) | ✅ Verified |
| 11 | Admin can view audit logs | ✅ Verified |
| 12 | E2E tests pass for auth, proposals, admin flows | ✅ Implemented |

---

## Requirements

### Functional
- User registration with email/password
- JWT-based login with role-based access (USER, MODERATOR, ADMIN)
- Proposal CRUD with title, description, and status lifecycle
- Voting system (one vote per user per proposal)
- Full-text search on proposals via PostgreSQL tsvector
- Admin dashboard with platform statistics
- User management with role assignment
- Proposal moderation (approve/close/reject)
- Audit logging for all actions

### Non-Functional
- Stateless authentication (JWT, no server-side sessions)
- Redis-backed rate limiting per endpoint group
- Input validation at API boundary (Zod schemas)
- Structured logging with correlation IDs for request tracing
- CORS and Helmet security headers
- Docker Compose for reproducible local development

---

## Build Sequence (Completed)

```
Phase 1: Infrastructure
  → Docker Compose with PostgreSQL, Redis, RabbitMQ
  → Database migrations (users, proposals, votes, audit_logs)

Phase 2: Backend Core
  → Authentication (register, login, JWT middleware, RBAC)
  → Proposal CRUD (create, read, update, delete)
  → Voting system (cast, remove, duplicate detection)
  → Redis caching (trending proposals, rate limiting)
  → Analytics endpoints (proposal stats, voting turnout)

Phase 3: Frontend Core
  → Landing page with trending proposals (SSR)
  → Login/register pages
  → Proposals listing with filters and pagination (SSR)
  → Proposal detail with voting
  → User dashboard

Phase 4: Admin Panel
  → Admin dashboard with stats cards and trends
  → Proposal moderation queue with approve/reject
  → User management with role assignment
  → Audit log viewer with pagination
  → Role-gated sidebar navigation

Phase 5: Quality
  → Playwright E2E tests (auth, proposals, admin)
  → Codebase cleanup (dead code removal, type deduplication)
  → Architecture documentation updates
```

---

## Test Strategy

| Layer | Strategy | Tools |
|-------|----------|-------|
| **Service/Business Logic** | Unit tests with mocks | Jest |
| **API Endpoints** | Integration tests | Jest + supertest |
| **E2E Flows** | Cross-browser browser tests | Playwright (chromium, firefox, webkit) |
| **Infrastructure** | Linting + type-check | ESLint, tsc |

---

## Next Steps

1. Add RabbitMQ vote consumer (currently publishes but doesn't consume)
2. Implement database migration runner (currently manual SQL files)
3. Add paginated audit log filtering by action/entity type
4. Extend admin analytics with time-series charts
5. Production: Kubernetes manifests, managed PostgreSQL/Redis
