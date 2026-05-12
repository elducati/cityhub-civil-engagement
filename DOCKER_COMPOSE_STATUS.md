# Docker Compose Stack — Current Status

## Stack Status: ✅ Running

All 8 services are operational:

```
NAME                    IMAGE                             STATUS                       PORTS
cityhub-api             cityhub-civil-engagement-api      Up                          0.0.0.0:3000->3000/tcp
cityhub-web             cityhub-civil-engagement-web      Up                          0.0.0.0:5173->5173/tcp
cityhub-postgres        postgres:16-alpine                Up (healthy)                0.0.0.0:5432->5432/tcp
cityhub-redis           redis:7-alpine                    Up (healthy)                0.0.0.0:6379->6379/tcp
cityhub-rabbitmq        rabbitmq:3.13-management-alpine   Up (healthy)                0.0.0.0:5672->5672/tcp, 15672->15672/tcp
cityhub-postgres-test   postgres:16-alpine                Up (healthy)                0.0.0.0:5433->5432/tcp
cityhub-redis-test      redis:7-alpine                    Up (healthy)                0.0.0.0:6380->6379/tcp
cityhub-rabbitmq-test   rabbitmq:3.13-management-alpine   Up (healthy)                0.0.0.0:5673->5672/tcp
```

---

## Service Endpoints

| Service | URL | Port | Status |
|---------|-----|------|--------|
| **API (Backend)** | http://localhost:3000 | 3000 | ✅ Running |
| **Web (Frontend)** | http://localhost:5173 | 5173 | ✅ Running |
| **PostgreSQL** | localhost:5432 | 5432 | ✅ Healthy |
| **Redis** | localhost:6379 | 6379 | ✅ Healthy |
| **RabbitMQ API** | http://localhost:15672 | 15672 | ✅ Healthy |
| **RabbitMQ AMQP** | localhost:5672 | 5672 | ✅ Healthy |
| **Test PostgreSQL** | localhost:5433 | 5433 | ✅ Healthy |
| **Test Redis** | localhost:6380 | 6380 | ✅ Healthy |

---

## Architecture Features

### Backend (Express + TypeScript)
- Layered architecture: Routes → Services → Repositories → PostgreSQL
- Redis: proposal caching, rate limiting, vote state tracking
- RabbitMQ: async vote message publishing
- JWT authentication with RBAC (USER, MODERATOR, ADMIN)
- Zod input validation on all endpoints
- Centralized error handling with correlation IDs
- Prometheus-style metrics endpoint (`/metrics`)

### Frontend (Next.js 14 App Router)
- Server Components for SSR-rendered pages (proposals, landing)
- Client Components for interactive features (auth, voting, admin)
- TanStack React Query for server-state caching
- Zustand for UI state management
- Material Design 3 theme via Tailwind CSS
- Cross-browser E2E testing via Playwright

### Admin Panel
- **Dashboard**: Real-time stats (users, proposals, votes, engagement rate)
- **Proposal Moderation**: Approve/close/reject proposals
- **User Management**: Role assignment (ADMIN only)
- **Audit Logs**: Immutable action trail with pagination
- Role-gated navigation (MODERATOR sees limited menu)

---

## Health Check

```
GET http://localhost:3000/api/health

Response:
{
  "status": "ok",
  "timestamp": "2026-05-12T...",
  "services": {
    "postgres": "healthy",
    "redis": "healthy",
    "rabbitmq": "healthy"
  }
}
```

---

## Quick Reference

### Rebuild a single service
```bash
docker compose up -d --build api    # Backend
docker compose up -d --build web    # Frontend
docker compose up -d --build api web  # Both
```

### View logs
```bash
docker compose logs -f api      # Follow backend logs
docker compose logs --tail 20   # Last 20 lines all services
```

### Database access
```bash
docker compose exec postgres psql -U postgres -d cityhub
docker compose exec redis redis-cli
```

### Run tests
```bash
docker compose exec api npm test          # Backend unit/integration
docker compose exec web npm run test:e2e  # Frontend E2E (Playwright)
```

---

## Common Issues

### Port already in use
```bash
# Find what's using port 3000
netstat -ano | findstr :3000
# Stop the container
docker compose stop api
```

### Container won't start
```bash
# Check logs
docker compose logs api
# Rebuild from scratch
docker compose build --no-cache api
```

### Frontend can't reach API
Check that `NEXT_PUBLIC_API_URL` is set correctly in docker-compose.yml:
- Browser requests use `http://localhost:3000`
- SSR requests use `http://api:3000` (Docker internal network)
