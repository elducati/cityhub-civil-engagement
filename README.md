# CityHub Civil Engagement Platform

A civil engagement platform enabling citizens to connect with their local government, submit issues, and participate in community decision-making.

## Prerequisites

- **Node.js**: v20.14.0 (use `.nvmrc` for version management)
- **Docker**: Latest stable version
- **Docker Compose**: v2.0+

## Project Overview

This is a monorepo using npm workspaces containing:

- **Backend**: Express.js API with PostgreSQL, Redis, and RabbitMQ
- **Frontend**: React + Vite SPA

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cityhub-civil-engagement
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Start all services with Docker Compose:
   ```bash
   docker compose up -d
   ```

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - RabbitMQ Management: http://localhost:15672 (guest/guest)

## Project Structure

```
cityhub-civil-engagement/
├── .github/workflows/      # CI/CD pipelines
├── packages/
│   ├── backend/            # Express.js API
│   │   ├── src/           # Source code
│   │   ├── test/          # Test files
│   │   └── Dockerfile     # Backend container
│   └── frontend/          # React + Vite SPA
│       ├── src/           # Source code
│       ├── Dockerfile     # Frontend container
├── docker-compose.yml     # Container orchestration
├── package.json           # Root package (workspaces)
└── README.md
```

## Running Tests

Run all tests across workspaces:
```bash
npm test
```

Run backend tests only:
```bash
npm run test --workspace=@cityhub/backend
```

Run frontend tests only:
```bash
npm run test --workspace=@cityhub/frontend
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development servers |
| `npm run build` | Build all packages |
| `npm run test` | Run tests |
| `npm run lint` | Lint all packages |
| `npm run lint:fix` | Fix linting issues |

## Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild containers
docker compose build --no-cache
```

## Architecture

The platform is designed to be architecture-neutral. Currently implemented with Express + Vite, but structured to allow future migration to NestJS + Next.js as specified in the master plan.

### Services

- **PostgreSQL**: Primary database for storing civic data
- **Redis**: Caching and session management
- **RabbitMQ**: Message queue for async operations

## License

Private - All rights reserved