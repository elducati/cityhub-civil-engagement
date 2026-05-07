# System Architecture Document (SAD)

## Civic Engagement Platform

---

## 1. High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[React + Vite<br/>localhost:5173]
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
    end

    subgraph "Cache Layer"
        RC[Redis 7<br/>:6379]
    end

    subgraph "Queue Layer"
        QM[RabbitMQ 3.13<br/>:5672]
        VW[Vote Worker<br/>Async Processor]
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

    AUTH --> PG
    PROP --> PG
    VOTE -->|"Buffer votes"| RC
    VOTE -->|"Async write"| QM
    VW --> RC
    VW --> PG
    ANAL --> RC
    ANAL --> PG
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
[Async Queue - RabbitMQ] ← Vote processing
    ↓
Response
```

---

## 2. Technology Stack Table

| Layer | Choice | Version | Reason |
|-------|--------|---------|--------|
| **Runtime** | Node.js | 20.14.0 | LTS, enterprise-ready, large ecosystem |
| **Backend Framework** | Express | ^4.18.x | Fast iteration, minimal boilerplate, easy NestJS migration |
| **Frontend Framework** | React | ^18.2.x | Component-based, mature ecosystem, easy Next.js migration |
| **Build Tool** | Vite | ^5.x | Fast HMR, optimized builds |
| **Language** | TypeScript | ^5.x | Type safety, better DX |
| **Database** | PostgreSQL | 16.x | ACID compliance, JSON/JSONB, GIN indexes, rich query planner |
| **Cache** | Redis | 7.x | Sub-millisecond latency, pub/sub, TTL support |
| **Queue** | RabbitMQ | 3.13.x | Reliable delivery, exchange routing, management UI |
| **Authentication** | JWT | RS256 | Stateless, scalable,Industry standard |
| **Password Hashing** | bcrypt | ^5.x | Adaptive cost, battle-tested |
| **Validation** | Zod | ^3.x | TypeScript-first, composable schemas |
| **ORM** | Knex.js | ^2.x | Query builder, migration support, SQL visibility |
| **Frontend State** | React Query | ^5.x | Server state caching, optimistic updates |
| **Styling** | Tailwind CSS | ^3.x | Utility-first, small bundle |
| **Deployment** | Docker Compose | Latest | Local dev, K8s-ready for prod |

---

## 3. Database Schema

### 3.1 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Full-text search index
CREATE INDEX idx_proposals_fts ON proposals USING GIN (to_tsvector('english', title || ' ' || description));
```

### 3.3 Votes Table

```sql
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

#### POST /api/auth/register
- **Auth**: Public
- **Request Body**:
```json
{
  "email": "string (valid email)",
  "password": "string (min 8 chars)",
  "role": "string (optional, default USER)"
}
```
- **Response** (201):
```json
{
  "id": "uuid",
  "email": "string",
  "role": "USER",
  "token": "jwt-token"
}
```

#### POST /api/auth/login
- **Auth**: Public
- **Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **Response** (200):
```json
{
  "id": "uuid",
  "email": "string",
  "role": "USER",
  "token": "jwt-token"
}
```

#### GET /api/auth/me
- **Auth**: Protected (Bearer token)
- **Response** (200):
```json
{
  "id": "uuid",
  "email": "string",
  "role": "USER",
  "createdAt": "ISO8601"
}
```

### 4.2 Proposals

#### GET /api/proposals
- **Auth**: Public
- **Query Params**: `page` (default 1), `limit` (default 10, max 100), `status` (optional), `sort` (createdAt|voteCount)
- **Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "authorId": "uuid",
      "status": "OPEN",
      "voteCount": 10,
      "createdAt": "ISO8601",
      "userVote": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### GET /api/proposals/:id
- **Auth**: Public
- **Response** (200):
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "author": { "id": "uuid", "email": "string" },
  "status": "OPEN",
  "voteCount": 10,
  "createdAt": "ISO8601",
  "userHasVoted": false
}
```

#### POST /api/proposals
- **Auth**: Protected
- **Request Body**:
```json
{
  "title": "string (3-500 chars)",
  "description": "string (10-10000 chars)"
}
```
- **Response** (201):
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "OPEN",
  "voteCount": 0,
  "createdAt": "ISO8601"
}
```

#### PUT /api/proposals/:id
- **Auth**: Protected (author only)
- **Request Body**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "status": "OPEN|CLOSED (optional)"
}
```
- **Response** (200):
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "CLOSED",
  "voteCount": 10,
  "updatedAt": "ISO8601"
}
```

#### DELETE /api/proposals/:id
- **Auth**: Protected (author or MODERATOR/ADMIN)
- **Response** (204): No content

### 4.3 Voting

#### POST /api/proposals/:id/vote
- **Auth**: Protected
- **Response** (201):
```json
{
  "proposalId": "uuid",
  "voteCount": 11,
  "userVoted": true
}
```

#### DELETE /api/proposals/:id/vote
- **Auth**: Protected
- **Response** (200):
```json
{
  "proposalId": "uuid",
  "voteCount": 10,
  "userVoted": false
}
```

### 4.4 Analytics

#### GET /api/analytics/proposals
- **Auth**: Protected (ADMIN only)
- **Response** (200):
```json
{
  "total": 100,
  "byStatus": {
    "OPEN": 80,
    "CLOSED": 15,
    "ARCHIVED": 5
  },
  "thisMonth": 25,
  "lastMonth": 20
}
```

#### GET /api/analytics/voting
- **Auth**: Protected (ADMIN only)
- **Response** (200):
```json
{
  "totalVotes": 500,
  "uniqueVoters": 200,
  "turnoutRate": 0.45,
  "votesByProposal": [
    { "proposalId": "uuid", "votes": 50 },
    { "proposalId": "uuid", "votes": 30 }
  ]
}
```

### 4.5 Health Check

#### GET /api/health
- **Auth**: Public
- **Response** (200):
```json
{
  "status": "ok",
  "timestamp": "ISO8601",
  "services": {
    "postgres": "healthy",
    "redis": "healthy",
    "rabbitmq": "healthy"
  }
}
```

---

## 5. UI Architecture

### 5.1 Page Map

| Route | Page | Auth | Description |
|-------|------|------|--------------|
| `/` | Home | Public | Landing page with trending proposals |
| `/login` | Login | Guest | Login form |
| `/register` | Register | Guest | Registration form |
| `/proposals` | Proposals List | Public | Paginated proposal list with filters |
| `/proposals/:id` | Proposal Detail | Public | Full proposal with vote UI |
| `/proposals/new` | Create Proposal | User | New proposal form |
| `/dashboard` | Dashboard | User | User's proposals and votes |
| `/admin` | Admin Panel | ADMIN | Analytics and moderation |

### 5.2 Component Hierarchy (Atomic Design)

```
┌─────────────────────────────────────────────────────────┐
│                    ATOMS                                 │
├──────────────────────────────────────────────────────��─��┤
│ Button        │ Primary, Secondary, Ghost variants    │
│ Input         │ Text, Email, Password, Textarea         │
│ Card          │ Proposal card with vote count          │
│ Badge         │ Status badges (OPEN/CLOSED)            │
│ Avatar        │ User avatar with role indicator       │
│ Spinner       │ Loading states                        │
│ Alert         │ Success, Error, Warning messages     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   MOLECULES                              │
├─────────────────────────────────────────────────────────┤
│ FormField    │ Input + Label + Error message          │
│ ProposalCard │ Card + Title + Description + Votes    │
│ VoteButton   │ Button + Counter + User state         │
│ SearchBar    │ Input + Icon + Clear button            │
│ Pagination   │ Page numbers + Prev/Next               │
│ FilterBar    │ Status filter + Sort dropdown         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   ORGANISMS                             │
├─────────────────────────────────────────────────────────┤
│ ProposalList │ FilterBar + SearchBar + Card list     │
│ Navigation   │ Logo + Nav links + Auth buttons       │
│ AuthForm     │ FormFields + Button + Error display  │
│ ProposalDetail│ Title + Description + VoteButton    │
│ Dashboard    │ Stats + User's proposals + Votes      │
│ AdminPanel   │ Analytics charts + Moderation list   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   TEMPLATES                              │
├─────────────────────────────────────────────────────────┤
│ PageLayout   │ Navigation + Outlet + Footer           │
│ DashboardLayout│ Sidebar + Header + Content area     │
│ AuthLayout   │ Centered card with branding           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    PAGES                                │
├─────────────────────────────────────────────────────────┤
│ HomePage     │ PageLayout + Hero + ProposalList        │
│ ProposalsPage│ PageLayout + SearchBar + ProposalList │
│ ProposalPage │ PageLayout + ProposalDetail + Comments │
│ CreatePage   │ PageLayout + AuthForm                  │
│ DashboardPage│ DashboardLayout + Dashboard             │
│ AdminPage    │ DashboardLayout + AdminPanel           │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Data Flow Narrative

### 6.1 User Registration Flow

```
1. Client: POST /api/auth/register {email, password}
            ↓
2. Express: Validate request body (Zod)
            ↓
3. AuthService: Check email uniqueness
               ↓
4. Database: INSERT INTO users (email, password_hash)
             ← bcrypt.hash(password, 12)
             ↓
5. JWTService: Generate token {userId, role, exp}
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
4. ProposalService:
   ├─ Validate user not suspended
   ├─ Check rate limit (10 proposals/day)
   └─ Generate slug
              ↓
5. Database: INSERT INTO proposals (title, description, author_id)
             Get INSERTED id
             ↓
6. Cache: Redis DEL proposals:*
         Redis DEL trending:*
              ↓
7. AuditLog: INSERT INTO audit_logs (user_id, 'CREATE', 'proposal')
             ↓
8. Response: {id, title, status: 'OPEN', voteCount: 0}
```

### 6.3 Vote Casting Flow (High Volume)

```
1. Client: POST /api/proposals/:id/vote
          Bearer token
           ↓
2. Express: JWT → req.user
           ↓
3. Validation: Proposal exists, status=OPEN
              ↓
4. VoteService:
   ├─ Check user hasn't voted (cache)
   └─ Check user != author
              ↓
5. Redis: GET vote:proposalId:userId
         If not exists:
           → SET vote:proposalId:userId 1 EX 300
           → HINCRBY vote:buffer proposalId 1
              ↓
6. RabbitMQ: Publish vote.cast message
            {proposalId, userId, timestamp}
              ↓
7. Vote Worker:
   ├─ Consume queue
   ├─ BEGIN transaction
   │  INSERT INTO votes (proposal_id, user_id)
   │  UPDATE proposals SET vote_count = vote_count + 1
   ├─ COMMIT
   └─ Redis DEL cache
              ↓
8. Response: {proposalId, voteCount: N+1, userVoted: true}
            (Optimistic - may adjust after DB write)
```

### 6.4 Proposal Listing Flow (Cached)

```
1. Client: GET /api/proposals?page=1&status=OPEN
           ↓
2. Cache: GET proposals:page=1:status=OPEN:sort=createdAt
        If HIT:
          → Return cached JSON + cache hit header
        If MISS:
          ↓
3. QueryBuilder:
   ├─ WHERE status = $1
   ├─ ORDER BY created_at DESC
   ├─ LIMIT 10 OFFSET 0
   └─ JOIN users ON author_id
              ↓
4. Database: SELECT + Execution
              ↓
5. Cache: SET proposals:page=1:status=OPEN:sort=createdAt
         JSON.stringify(result) EX 60
              ↓
6. Response: {data: [...], pagination: {...}}
```

---

## 7. Docker Stage Map

### 7.1 Development Stage

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: civic_engagement
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: dev
      RABBITMQ_DEFAULT_PASS: dev
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: packages/api/Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://dev:dev@postgres:5432/civic_engagement
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://dev:dev@rabbitmq:5672
      JWT_SECRET: dev-secret-change-in-prod
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    volumes:
      - ./packages/api:/app
      - /app/node_modules

  web:
    build:
      context: .
      dockerfile: packages/web/Dockerfile.dev
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000/api
    depends_on:
      - api
    volumes:
      - ./packages/web:/app
      - /app/node_modules
```

### 7.2 Build Stage

```yaml
# packages/api/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY packages/api/package*.json ./
RUN npm ci
COPY packages/api/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY packages/api/package*.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]

# packages/web/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY packages/web/package*.json ./
RUN npm ci
COPY packages/web/ ./
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 7.3 Production Stage

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: civic_engagement
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    user: postgres:postgres

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    user: redis:redis

  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}

  api:
    build:
      context: .
      dockerfile: packages/api/Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      RABBITMQ_URL: ${RABBITMQ_URL}
      JWT_SECRET: ${JWT_SECRET}
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: packages/web/Dockerfile
    restart: unless-stopped
```

### 7.4 Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| `NODE_ENV` | development | production |
| `DATABASE_URL` | postgresql://dev:dev@... | (secret) |
| `REDIS_URL` | redis://localhost:6379 | (secret) |
| `RABBITMQ_URL` | amqp://dev:dev@... | (secret) |
| `JWT_SECRET` | dev-secret | (min 256-bit) |
| `POSTGRES_USER` | dev | (secret) |
| `POSTGRES_PASSWORD` | dev | (secret) |
| `RABBITMQ_USER` | dev | (secret) |
| `RABBITMQ_PASSWORD` | dev | (secret) |

---

## 8. Security Considerations

### 8.1 Authentication
- JWT tokens: 1 hour expiry, refresh token 7 days
- Password requirements: min 8 chars, complexity not enforced for MVP
- Rate limiting: 10 requests/minute per IP on auth endpoints

### 8.2 Authorization
- Roles: USER, MODERATOR, ADMIN
- USER: create proposals, vote, view own data
- MODERATOR: + delete any proposal, view all data
- ADMIN: + analytics, user management

### 8.3 Data Protection
- Passwords: bcrypt hashed (cost 12)
- HTTPS only in production
- CORS: specific origins only
- Helmet: security headers

---

## 9. Migration Path

### 9.1 Express → NestJS

Architecture supports future NestJS migration:
- Current service layer → NestJS services (@Injectable)
- Current routes → NestJS controllers (@Controller)
- Current middleware → NestJS guards/middleware
- Knex.js → TypeORM or Prisma (compatible schema)

### 9.2 React + Vite → Next.js

Architecture supports future Next.js migration:
- Current components → Next.js pages
- React Query → Next.js data fetching (server components)
- Current routing → Next.js App Router
- Vite config → Next.js config (compatible)

---

## 10. Appendix

### 10.1 Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - validation failed |
| 401 | Unauthorized - invalid/missing token |
| 403 | Forbidden - insufficient permissions |
| 404 | Not Found - resource doesn't exist |
| 409 | Conflict - duplicate/invalid state |
| 429 | Too Many Requests - rate limit exceeded |
| 500 | Internal Server Error |

### 10.2 Index Summary

| Table | Index | Type | Columns |
|-------|-------|------|---------|
| users | idx_users_email | B-tree | email |
| users | idx_users_role | B-tree | role |
| proposals | idx_proposals_status | B-tree | status |
| proposals | idx_proposals_created_at | B-tree | created_at |
| proposals | idx_proposals_vote_count | B-tree | vote_count |
| proposals | idx_proposals_fts | GIN | tsvector |
| proposals | idx_proposals_author_id | B-tree | author_id |
| votes | votes_proposal_id_user_id | Unique | (proposal_id, user_id) |
| votes | idx_votes_proposal_id | B-tree | proposal_id |
| votes | idx_votes_user_id | B-tree | user_id |
| audit_logs | idx_audit_logs_entity | B-tree | entity_type, entity_id |
| audit_logs | idx_audit_logs_user_id | B-tree | user_id |
| audit_logs | idx_audit_logs_created_at | B-tree | created_at |

---

*Document Version: 1.0*
*Last Updated: 2026-05-07*