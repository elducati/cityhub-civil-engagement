# System Architecture Document (SAD)

## Civic Engagement Platform

---

## 1. High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Next.js 14 App Router<br/>localhost:5173]
    end

    subgraph "API Gateway Layer"
        API[Express API<br/>localhost:3000]
        JWT[JWT Auth<br/>Middleware]
        RL[Rate Limiter<br/>Redis-backed]
    end

    subgraph "Service Layer"
        AUTH[Auth Service<br/>Register/Login]
        PROP[Proposal Service<br/>CRUD]
        VOTE[Voting Service<br/>Cast/Remove]
        ANAL[Analytics Service<br/>Stats]
        ADM[Admin Service<br/>Dashboard/Users/Audit]
    end

    subgraph "Cache Layer"
        RC[Redis 7<br/>:6379]
    end

    subgraph "Queue Layer"
        QM[RabbitMQ 3.13<br/>:5672]
    end

    subgraph "Data Layer"
        PG[PostgreSQL 16<br/>:5432]
    end

    WEB -->|"HTTPS"| API
    API --> JWT
    JWT --> RL
    RL --> AUTH
    RL --> PROP
    RL --> VOTE
    RL --> ANAL
    RL --> ADM

    AUTH --> PG
    PROP --> PG
    VOTE --> RC
    VOTE --> PG
    ANAL --> RC
    ANAL --> PG
    ADM --> PG
    ADM --> RC
```

### Request Flow Summary

```
Client Request
    ↓
[Rate Limiter - Redis] ← Express Middleware
    ↓
[JWT Validator] ← Bearer token verification
    ↓
[Service Handler] ← Business logic
    ↓
[Cache Check - Redis] ← GET first, SET on miss
    ↓
[Database - PostgreSQL] ← Persistent storage
    ↓
Response
```

---

## 2. Technology Stack Table

| Layer | Choice | Version | Reason |
|-------|--------|---------|--------|
| **Runtime** | Node.js | 20.14.0 | LTS, enterprise-ready, large ecosystem |
| **Backend Framework** | Express | ^4.18.x | Fast iteration, minimal boilerplate, easy NestJS migration |
| **Frontend Framework** | Next.js | 14.2.3 | App Router, SSR/ISR, built-in API proxying |
| **Language** | TypeScript | ^5.x | Type safety, better DX |
| **Database** | PostgreSQL | 16.x | ACID compliance, JSON/JSONB, GIN indexes |
| **Cache** | Redis | 7.x | Sub-millisecond latency, pub/sub, TTL support |
| **Queue** | RabbitMQ | 3.13.x | Reliable delivery, management UI |
| **Authentication** | JWT | RS256 | Stateless, scalable, industry standard |
| **Password Hashing** | bcryptjs | ^2.4.x | Adaptive cost, battle-tested |
| **Validation** | Zod | ^3.x | TypeScript-first, composable schemas |
| **Query Builder** | Knex.js | ^3.x | SQL visibility, migration support |
| **Server State** | TanStack Query | ^5.x | Client-side caching, auto-invalidation |
| **UI State** | Zustand | ^4.x | Lightweight client state |
| **Forms** | React Hook Form | ^7.x | Performant form handling |
| **Styling** | Tailwind CSS | ^3.x | Utility-first, Material Design 3 theme |
| **Components** | Radix UI | latest | Accessible, headless primitives |
| **Deployment** | Docker Compose | Latest | Local dev, K8s-ready for prod |

---

## 3. Database Schema

### 3.1 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'MODERATOR', 'ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 3.2 Proposals Table

```sql
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'ARCHIVED')),
    vote_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX idx_proposals_vote_count ON proposals(vote_count DESC);
CREATE INDEX idx_proposals_author_id ON proposals(author_id);
```

### 3.3 Votes Table

```sql
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, user_id)
);

CREATE INDEX idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
```

### 3.4 Audit Logs Table (Insert-Only)

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 3.5 Updated At Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 4. API Contract

### 4.1 Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Get current user profile |

#### POST /api/auth/register
- **Request Body**: `{ email: string, password: string (min 6), name?: string, role?: string }`
- **Response** (201): `{ id: uuid, email: string, role: string, token: jwt }`

#### POST /api/auth/login
- **Request Body**: `{ email: string, password: string }`
- **Response** (200): `{ id: uuid, email: string, role: string, token: jwt }`

#### GET /api/auth/me
- **Response** (200): `{ id: uuid, email: string, role: string, createdAt: ISO8601 }`

### 4.2 Proposals

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/proposals/trending` | Public | Trending proposals (cached) |
| GET | `/api/proposals` | Optional | Paginated list with filters |
| GET | `/api/proposals/:id` | Optional | Proposal detail with author |
| POST | `/api/proposals` | Bearer | Create proposal |
| PUT | `/api/proposals/:id` | Bearer | Update (owner/MOD+) |
| DELETE | `/api/proposals/:id` | Bearer | Delete (owner/MOD+) |
| POST | `/api/proposals/:id/vote` | Bearer | Cast vote |
| DELETE | `/api/proposals/:id/vote` | Bearer | Remove vote |

#### GET /api/proposals
- **Query Params**: `page` (1), `limit` (10, max 100), `status` (OPEN/CLOSED/ARCHIVED), `sort` (createdAt/voteCount), `search` (full-text)
- **Response** (200):
```json
{
  "data": [{ "id": "uuid", "title": "string", "authorId": "uuid", "status": "OPEN", "voteCount": 10, "createdAt": "ISO8601", "userVote": true }],
  "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }
}
```

#### POST /api/proposals
- **Request Body**: `{ title: string (3-500), description: string (10-10000) }`
- **Response** (201): `{ id, title, description, authorId, status: "OPEN", voteCount: 0, createdAt }`

### 4.3 Voting

#### POST /api/proposals/:id/vote
- **Response** (201): `{ proposalId: uuid, voteCount: number, userVoted: true }`

#### DELETE /api/proposals/:id/vote
- **Response** (200): `{ proposalId: uuid, voteCount: number, userVoted: false }`

### 4.4 Admin

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/api/admin/dashboard` | ADMIN, MODERATOR | Platform stats + trends |
| GET | `/api/admin/users` | ADMIN | Paginated user list |
| PUT | `/api/admin/users/:id/role` | ADMIN | Change user role |
| GET | `/api/admin/audit-logs` | ADMIN | Paginated audit trail |
| GET | `/api/analytics/proposals` | ADMIN | Proposal analytics |
| GET | `/api/analytics/voting` | ADMIN | Voting analytics |

#### GET /api/admin/dashboard
- **Response** (200):
```json
{
  "totalUsers": 100,
  "totalProposals": 250,
  "totalVotes": 1200,
  "engagementRate": 0.45,
  "proposalsByStatus": { "OPEN": 80, "CLOSED": 15, "ARCHIVED": 5 },
  "usersByRole": { "USER": 90, "MODERATOR": 8, "ADMIN": 2 },
  "thisMonthProposals": 25,
  "lastMonthProposals": 20,
  "recentActivity": [{ "id": "uuid", "action": "CREATE", "entityType": "proposal", "userId": "uuid", "createdAt": "ISO8601" }]
}
```

### 4.5 Health Check

#### GET /api/health
- **Response** (200):
```json
{ "status": "ok", "timestamp": "ISO8601", "services": { "postgres": "healthy", "redis": "healthy", "rabbitmq": "healthy" } }
```

### 4.6 Metrics

#### GET /metrics
- **Response** (200, text/plain): Prometheus-style metrics (request counts, durations, memory, uptime)

---

## 5. UI Architecture

### 5.1 Page Map

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | Home | Public | Landing page with hero, stats, trending proposals |
| `/login` | Login | Guest | Login form |
| `/register` | Register | Guest | Registration form |
| `/proposals` | Proposals List | Public | Paginated list with status filters |
| `/proposals/:id` | Proposal Detail | Public | Full proposal with vote button |
| `/proposals/create` | Create Proposal | User | Multi-step proposal form |
| `/dashboard` | Dashboard | User | Personal overview |
| `/admin` | Admin Dashboard | ADMIN/MOD | Platform stats and engagement |
| `/admin/proposals` | Moderation Queue | ADMIN/MOD | Proposal approve/reject |
| `/admin/users` | User Management | ADMIN | Role management |
| `/admin/audit-logs` | Audit Logs | ADMIN | Immutable action trail |

### 5.2 Component Hierarchy (Atomic Design)

```
ATOMS
  Button          — Primary, Secondary, Outline, Ghost, Success, Danger, Warning
  Input           — Text, Email, Password
  Card            — Container with CardHeader, CardContent, CardFooter
  Badge           — Status indicators with variant colors
  Avatar          — User avatar with fallback initials
  Label           — Form label
  Separator       — Radix UI divider

MOLECULES
  StatusChip      — Badge + status styling (OPEN/CLOSED/ARCHIVED)
  VoteCounter     — Vote count display
  ProposalForm    — Multi-step form (react-hook-form + zod)
  NavBar          — Navigation with auth state

ORGANISMS
  AdminLayout     — Sidebar + content with role-gated nav items
  DashboardCards  — Stat cards with trend indicators
  UserTable       — Paginated table with role dropdown
  AuditLogTable   — Paginated audit log viewer
  ProposalTable   — Moderation queue with approve/reject buttons

PAGES
  HomePage        — Landing page with SSR-rendered trending proposals
  ProposalsPage   — SSR listing with filters and pagination
  ProposalPage    — Proposal detail with voting
  CreatePage      — Multi-step form (client component)
  LoginPage       — Login form
  RegisterPage    — Registration form
  DashboardPage   — User dashboard
  AdminPage       — Admin dashboard (client, auto-refresh)
  AdminUsersPage  — User management (ADMIN only)
  AdminAuditPage  — Audit logs (ADMIN only)
  AdminProposals  — Moderation queue
```

---

## 6. Data Flow Narratives

### 6.1 User Registration Flow

```
1. Client: POST /api/auth/register {email, password, name}
            ↓
2. Express: Validate request body (Zod)
            ↓
3. AuthService: Check email uniqueness
               ↓
4. Database: INSERT INTO users (email, name, password_hash)
             ← bcrypt.hash(password, 12)
             ↓
5. JWT: Generate token {userId, role, exp}
            ↓
6. AuditLog: INSERT INTO audit_logs (user_id, 'CREATE', 'user')
            ↓
7. Response: {id, email, role, token}
```

### 6.2 Proposal Creation Flow

```
1. Client: POST /api/proposals {title, description}
           Bearer token
           ↓
2. Express: JWT middleware → req.user
           ↓
3. Validation: title 3-500, description 10-10000
               ↓
4. ProposalService → proposalRepository.createProposal()
               ↓
5. Database: INSERT INTO proposals (title, description, author_id)
               ↓
6. Cache: Redis DEL proposals:trending:10
               ↓
7. AuditLog: INSERT INTO audit_logs (user_id, 'CREATE', 'proposal')
             ↓
8. Response: {id, title, status: 'OPEN', voteCount: 0, ...}
```

### 6.3 Vote Casting Flow

```
1. Client: POST /api/proposals/:id/vote
           Bearer token
           ↓
2. Express: JWT → req.user
           ↓
3. Validation: Proposal exists, status=OPEN
              ↓
4. VoteService → proposalRepository.findById()
              ↓
5. Check: user != author, not already voted (Redis cache + DB)
              ↓
6. Database: INSERT INTO votes, INCREMENT proposals.vote_count
              ↓
7. Redis: SET vote:proposalId:userId, DEL proposals:trending:10
              ↓
8. RabbitMQ: Publish vote message (fire-and-forget)
              ↓
9. AuditLog: INSERT INTO audit_logs (user_id, 'VOTE', 'proposal')
             ↓
10. Response: {proposalId, voteCount: N+1, userVoted: true}
```

### 6.4 Proposal Listing Flow (Cached)

```
1. Client: GET /api/proposals?page=1&status=OPEN
           (optional Bearer token for userVote status)
           ↓
2. ProposalService → proposalRepository.findPaginated()
           ↓
3. QueryBuilder:
   ├─ WHERE status = $1
   ├─ Optional: to_tsvector search
   ├─ ORDER BY created_at DESC / vote_count DESC
   ├─ LIMIT $2 OFFSET $3
   └─ Optional: LEFT JOIN votes for current user
              ↓
4. Database: SELECT + Execution
              ↓
5. Response: {data: [...], pagination: {...}}
```

---

## 7. Docker Architecture

### 7.1 Services

| Service | Image | Port | Health Check | Dependencies |
|---------|-------|------|-------------|--------------|
| postgres | postgres:16-alpine | 5432 | pg_isready | — |
| redis | redis:7-alpine | 6379 | redis-cli ping | — |
| rabbitmq | rabbitmq:3.13-management | 5672, 15672 | rabbitmq-diagnostics | — |
| api | Custom (Dockerfile target: development) | 3000 | — | postgres, redis, rabbitmq |
| web | Custom (Dockerfile target: development) | 5173 | — | api |
| postgres-test | postgres:16-alpine | 5433 | pg_isready | — |
| redis-test | redis:7-alpine | 6380 | redis-cli ping | — |
| rabbitmq-test | rabbitmq:3.13-management | 5673 | rabbitmq-diagnostics | — |

### 7.2 Environment Variables

| Variable | Description | Default (Dev) |
|----------|-------------|---------------|
| NODE_ENV | Environment mode | development |
| PORT | API server port | 3000 |
| DATABASE_URL | PostgreSQL connection | postgresql://postgres:postgres@postgres:5432/cityhub |
| REDIS_URL | Redis connection | redis://redis:6379 |
| RABBITMQ_URL | RabbitMQ connection | amqp://guest:guest@rabbitmq:5672 |
| AUTH_JWT_SECRET | JWT signing key (min 32 chars) | dev-secret-key-minimum-32-characters-required |
| AUTH_JWT_EXPIRY | Token expiration | 7d |
| FRONTEND_URL | CORS origin | http://localhost:5173 |
| NEXT_PUBLIC_API_URL | Frontend API URL (browser) | http://localhost:3000 |
| API_URL_FOR_SERVER | Frontend API URL (SSR) | http://api:3000 |

---

## 8. Security Architecture

### 8.1 Authentication
- JWT tokens: configurable expiry (7d dev default, 1h prod recommendation)
- Password hashing: bcrypt with cost factor 12, 10-second timeout
- Rate limiting per endpoint group (auth: 10/min, api: 100/min, voting: 30/min)

### 8.2 Authorization (RBAC)
- **USER**: create proposals, vote, view own dashboard
- **MODERATOR**: USER + moderate any proposal (approve/close/reject)
- **ADMIN**: MODERATOR + user management, role assignment, audit logs, analytics

Role hierarchy enforced via `requireRole(...roles)` middleware:
```
USER=1 < MODERATOR=2 < ADMIN=3
```

### 8.3 Data Protection
- Passwords: bcrypt hashed (never stored in plaintext)
- CORS: restricted to `FRONTEND_URL` only
- Helmet: security headers (CSP, XSS protection, etc.)
- Input validation: Zod on all API request bodies
- Audit trail: immutable log of all CREATE/UPDATE/DELETE/VOTE actions

---

## 9. Migration Path

### 9.1 Express → NestJS
- Current service layer → NestJS services (@Injectable)
- Current routes → NestJS controllers (@Controller)
- Current middleware → NestJS guards/middleware
- Current Zod validation → NestJS pipes

### 9.2 Frontend → Enhanced
- Current server components → Extended ISR/cache strategies
- Client components → Micro-frontend boundaries
- Current API client → tRPC or GraphQL integration

---

## 10. Appendix

### 10.1 Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request — validation failed |
| 401 | Unauthorized — invalid/missing token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found — resource doesn't exist |
| 409 | Conflict — duplicate/invalid state |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable — DB/Redis timeout |

### 10.2 Index Summary

| Table | Index | Type | Columns |
|-------|-------|------|---------|
| users | idx_users_email | B-tree | email |
| users | idx_users_role | B-tree | role |
| proposals | idx_proposals_status | B-tree | status |
| proposals | idx_proposals_created_at | B-tree | created_at |
| proposals | idx_proposals_vote_count | B-tree | vote_count |
| proposals | idx_proposals_author_id | B-tree | author_id |
| votes | votes_proposal_id_user_id | Unique | (proposal_id, user_id) |
| votes | idx_votes_proposal_id | B-tree | proposal_id |
| votes | idx_votes_user_id | B-tree | user_id |
| audit_logs | idx_audit_logs_entity | B-tree | entity_type, entity_id |
| audit_logs | idx_audit_logs_user_id | B-tree | user_id |
| audit_logs | idx_audit_logs_created_at | B-tree | created_at |

---

*Document Version: 2.0*
*Last Updated: 2026-05-12*
