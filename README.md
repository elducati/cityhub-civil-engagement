# CityHub Civil Engagement Platform

A civil engagement platform enabling citizens to connect with their local government, submit proposals, vote on community issues, and collaborate with local leaders — built with enterprise-grade architecture patterns.

## Prerequisites

- **Node.js**: v20.14.0 (use `.nvmrc` for version management)
- **Docker**: Latest stable version
- **Docker Compose**: v2.0+

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd cityhub-civil-engagement
npm install

# Configure environment
cp .env.example .env

# Start all services (detached)
docker compose up -d

# Access the application
# Frontend:  http://localhost:5173
# API:       http://localhost:3000
# RabbitMQ:  http://localhost:15672 (guest/guest)
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | React framework with SSR/ISR |
| **Backend** | Express.js + TypeScript | REST API with layered architecture |
| **Database** | PostgreSQL 16 (via Knex) | ACID-compliant relational data store |
| **Cache** | Redis 7 | Session state, rate limiting, query caching |
| **Queue** | RabbitMQ 3.13 | Async vote message processing |
| **Auth** | JWT (bcryptjs + jsonwebtoken) | Stateless authentication with RBAC |
| **Validation** | Zod | Runtime schema validation (API + forms) |
| **State** | TanStack Query + Zustand | Server-state caching + UI state |
| **Styling** | Tailwind CSS (Material Design 3) | Utility-first design system |
| **Testing** | Playwright + Jest | E2E browser tests + unit/integration tests |
| **Infra** | Docker Compose | Local development orchestration |

## Project Structure

```
cityhub-civil-engagement/
├── docker-compose.yml              # 8 services (3 app + 3 infra + 2 test)
├── .github/workflows/ci.yml        # GitHub Actions CI pipeline
├── packages/
│   ├── backend/                    # Express.js API
│   │   ├── src/
│   │   │   ├── config/            # Env validation, DB, Redis connections
│   │   │   ├── middleware/        # Auth (JWT + RBAC), rate limiting, error handling
│   │   │   ├── routes/            # auth, proposals, admin, analytics, metrics
│   │   │   ├── services/          # Business logic layer
│   │   │   ├── repositories/      # Data access layer (Knex queries)
│   │   │   ├── types/             # TypeScript type definitions
│   │   │   └── index.ts           # Express app entry point
│   │   ├── db/migrations/         # SQL migration files
│   │   ├── tests/                 # Integration + unit tests
│   │   └── Dockerfile             # Multi-stage build
│   └── frontend/                  # Next.js 14 application
│       ├── app/                   # App Router pages + layouts
│       │   ├── (auth)/            # Login, register pages
│       │   ├── (protected)/       # Dashboard, admin panel
│       │   ├── proposals/         # Proposals listing + detail
│       │   └── page.tsx           # Landing page
│       ├── components/            # Atomic design component library
│       │   ├── ui/                # Atoms (Button, Card, Badge, Input, Avatar...)
│       │   ├── molecules/         # Molecules (ProposalForm)
│       │   └── organisms/         # Organisms (NavBar)
│       ├── hooks/                 # useAuth, useProposals, useAdmin
│       ├── lib/                   # API client, auth, proposals, admin, utils
│       ├── store/                 # Zustand UI store
│       ├── types/                 # Shared TypeScript interfaces
│       ├── tests/                 # Playwright E2E tests
│       ├── playwright.config.ts   # Cross-browser test config
│       └── Dockerfile             # Multi-stage build
├── .gitignore
├── .nvmrc
└── package.json                   # Monorepo (npm workspaces)
```

## Architecture

### Layered Backend (Routes → Services → Repositories → DB)

```
Client → Express Router → Zod Validation → Service Layer → Repository → PostgreSQL
                                ↓                              ↓
                          Error Handler                    Redis Cache
```

- **Routes**: Parse request params, delegate to services, return responses
- **Services**: Business logic, caching decisions, audit logging, orchestration
- **Repositories**: Data access via Knex query builder, row mapping
- **Middleware Pipeline**: Correlation ID → Request Logging → Rate Limiter → Auth → Route

### Frontend State Flow

```
Page (RSC/Client) → React Query Hook → API Client (fetch) → Express API
       ↓                                               ↓
  RSC: Direct fetch on server                    Client: fetch via browser
  Client: useQuery with staleTime                 Auth token via localStorage
```

- **Server Components**: Proposals listing, landing page (SSR with cache)
- **Client Components**: Auth flows, voting, admin panel (interactive)
- **TanStack Query**: Server-state with automatic cache invalidation on mutations

## Features

### Authentication & Authorization
- **Register**: Email/password + name with bcrypt hashing
- **Login**: JWT token generation (configurable expiry)
- **RBAC**: Three roles — `USER`, `MODERATOR`, `ADMIN`
- **Protected Routes**: Middleware-enforced auth guards
- **Admin Guard**: Role-based sidebar navigation (MODERATOR sees limited menu)
- **Live Auth Sync**: `useSyncExternalStore` pattern ensures NavBar and all components reflect auth state instantly after login/logout — no polling, no stale state

### Proposals
- **Create**: Multi-step form (title → description → category → tags → location)
- **Categories**: Predefined set (Infrastructure, Environment, Public Safety, Transportation, Community, Other) with color-coded badges
- **Location**: Optional latitude/longitude coordinates stored with proposal
- **Browse**: Server-rendered listing with filters (status, category, sort) and pagination
- **Detail**: Full proposal view with category badge, location coordinates (when present), voting, and author info
- **Trending**: Cached top-voted proposals on landing page
- **Voting**: One vote per user per proposal; Redis-backed duplicate detection
- **Full-text Search**: PostgreSQL `to_tsvector` / `plainto_tsquery` on title + description

### Admin Dashboard
- **Overview**: Stats cards (users, proposals, votes, engagement rate) with trend arrows
- **Proposals by Status**: SVG bar chart with proportional bars and count labels
- **Users by Role**: SVG donut chart showing role distribution with legend
- **Proposal Trends**: Monthly comparison bar chart (this month vs last month)
- **Recent Activity**: Live audit log feed
- **User Management**: Paginated user table with inline role dropdown (ADMIN only)
- **Proposal Moderation**: Filterable queue with Approve (→ CLOSED) / Reject (→ ARCHIVED)
- **Audit Logs**: Immutable action trail with pagination and action-type filter buttons
- **CSV Export**: Download all proposals as CSV (columns: ID, Title, Description, Status, Votes, Category, Author, Date)
- **Auto-refresh**: Dashboard stats refresh every 30 seconds

### Notifications & UX
- **Toast System**: Success/error/warning/info toasts with 4-second auto-dismiss, wired into all mutations (login, register, logout, create proposal, vote, admin role changes)
- **Skeleton Loading**: Card and table row skeletons replace full-page spinners on admin pages — content-shaped placeholders during load

### Analytics
- **Proposal Analytics**: Total counts, status distribution, monthly trends (with cache)
- **Voting Analytics**: Vote totals, unique voters, turnout rate, top proposals
- **Prometheus Metrics**: `/metrics` endpoint with request counts, durations, memory

### Security
- JWT authentication with configurable secrets (32+ char minimum)
- Redis-backed distributed rate limiting (auth: 10/min, api: 100/min, voting: 30/min)
- CORS restricted to frontend origin
- Helmet security headers with CSP
- Role hierarchy (USER=1, MODERATOR=2, ADMIN=3) for permission checks
- Input validation via Zod schemas on all API endpoints

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health check |
| GET | `/` | API version info |
| GET | `/api/proposals/trending` | Trending proposals (cached) |
| GET | `/api/proposals` | List proposals (optional auth for user vote status) |
| GET | `/api/proposals/:id` | Proposal detail (optional auth) |

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Get current user profile |

### Proposals (Authenticated)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/proposals` | USER+ | Create proposal (supports category, lat/lng) |
| PUT | `/api/proposals/:id` | Owner/MOD+ | Update proposal |
| DELETE | `/api/proposals/:id` | Owner/MOD+ | Delete proposal |
| POST | `/api/proposals/:id/vote` | USER+ | Cast vote |
| DELETE | `/api/proposals/:id/vote` | USER+ | Remove vote |
| GET | `/api/proposals/export/csv` | ADMIN/MOD | Download all proposals as CSV |

### Admin
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/admin/dashboard` | ADMIN/MOD | Platform stats + trends |
| GET | `/api/admin/users` | ADMIN | Paginated user list |
| PUT | `/api/admin/users/:id/role` | ADMIN | Change user role |
| GET | `/api/admin/audit-logs` | ADMIN | Paginated audit trail |
| GET | `/api/analytics/proposals` | ADMIN | Proposal analytics |
| GET | `/api/analytics/voting` | ADMIN | Voting analytics |
| GET | `/metrics` | — | Prometheus-style metrics |

## Running Tests

```bash
# All tests (workspaces)
npm test

# Backend (Jest)
npm run test --workspace=@cityhub/backend

# Frontend unit/integration (Jest)
npm run test --workspace=@cityhub/frontend

# E2E tests (Playwright - chromium, firefox, webkit)
npm run test:e2e --workspace=@cityhub/frontend
```

### Test Structure
```
tests/
├── e2e/
│   ├── auth.spec.ts          # Login, logout, redirect, error states
│   ├── proposals.spec.ts     # Create, validate, filter, vote flows
│   └── admin.spec.ts         # Dashboard, users, audit logs, RBAC
├── fixtures/
│   └── identities.ts         # Test user/proposal data
└── setup.ts                  # Test environment mocks
```

## Development Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start all services |
| `docker compose up -d --build <service>` | Rebuild and start specific service |
| `docker compose logs -f` | Follow all logs |
| `docker compose down` | Stop all services |
| `npm run dev` | Start local dev servers |
| `npm run build` | Build all packages |
| `npm run test` | Run tests |
| `npm run lint` | Lint all packages |
| `npm run lint:fix` | Fix linting issues |
| `npm run migrate --workspace=@cityhub/backend` | Run database migrations |

## Data Model

### Tables
- **users**: `id (UUID)`, `email (unique)`, `name`, `password_hash`, `role` (USER/MODERATOR/ADMIN), `created_at`, `updated_at`
- **proposals**: `id (UUID)`, `title`, `description`, `author_id` (FK→users), `status` (OPEN/CLOSED/ARCHIVED), `vote_count`, `category` (optional), `latitude` (optional), `longitude` (optional), `created_at`, `updated_at`
- **votes**: `id (UUID)`, `proposal_id` (FK→proposals), `user_id` (FK→users), `created_at` (unique on proposal+user)
- **audit_logs**: `id (UUID)`, `user_id` (FK→users, nullable), `action`, `entity_type`, `entity_id`, `metadata (JSON)`, `created_at`
- **GIN indexes**: Full-text search on proposal title + description

## Design Decisions

### Why Knex over raw SQL/ORM?
- Full control over query construction with parameterization
- Migration system without magic
- Explicit `.returning()` for consistent insert results

### Why Repository Pattern?
- Isolates DB query logic from business rules
- Enables testing services without database
- Single place to add caching, logging

### Why separate `<service>` and `<repository>` types?
Backend defines `Proposal` differently in three layers:
- **Repository**: snake_case (`author_id`, `vote_count`) — matches DB columns
- **Service**: camelCase (`authorId`, `voteCount`) — API contract
- **Frontend**: camelCase — consumed by React components

The service layer handles the conversion via `mapRow()`, keeping DB internals from leaking to the API.

## Refactoring History

| Date | Change | Rationale |
|------|--------|-----------|
| 2026-05 | Service-Repository unification | Eliminated duplicated SQL in `proposalService.ts` — delegated all data access to `proposalRepository.ts` |
| 2026-05 | Redis connection consolidation | Unified 3 separate Redis clients (`cacheService`, `rateLimiter`, `index.ts`) into a shared `config/redis.ts` |
| 2026-05 | Type deduplication | Removed duplicate interfaces from `lib/auth.ts`, `lib/proposals.ts`, `services/proposalService.ts` — all types now live in `types/` or their canonical location |
| 2026-05 | Dynamic API URL resolution | Fixed SSR/client hydration mismatch where `API_BASE` was computed once at module init |
| 2026-05 | Targeted cache invalidation | Replaced aggressive `deleteCachePattern('proposals:*')` on every vote with single-key `deleteCache('proposals:trending:10')` |
| 2026-05 | Codebase cleanup | Removed ~70 files (build artifacts, compiled test outputs, empty directories, dead code functions) |
| 2026-05 | Admin dashboard | Full admin panel: dashboard stats, user management, proposal moderation, audit logs, CSV export |
| 2026-05 | Categories + location | Added category/lat/lng to proposals — migration, API, form, listing filters, detail badge |
| 2026-05 | Standard API envelope | All responses wrapped in `{success, data, error}` via middleware; frontend client unwraps transparently |
| 2026-05 | Toast notifications | 4-type toast system with auto-dismiss, wired into all mutations via Zustand store |
| 2026-05 | Skeleton loading | Card/table skeleton components replacing full-page spinners |
| 2026-05 | Query bounds validation | Middleware clamps `page` (1-1000) and `limit` (1-100) to prevent DB abuse |
| 2026-05 | Migration runner | `npm run migrate` applies SQL files in order, tracks in `_migrations` table, idempotent |
| 2026-05 | Dashboard charts | Pure SVG BarChart, DonutChart, TrendChart — no external dependencies |
| 2026-05 | Auth live-reload | `useSyncExternalStore` module-level generation counter — all components react to login/logout instantly |
| 2026-05 | SEO meta tags | Dynamic per-page titles via `metadata` export (SSR) and `usePageTitle` hook (client) |
| 2026-05 | feat: add Public Roadmap page showing Planned and Implemented proposals on a timeline with status badges and voting stats |

## License

Private — All rights reserved
