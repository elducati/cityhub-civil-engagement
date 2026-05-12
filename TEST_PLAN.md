# Test Plan - Civic Engagement Platform QA Suite
# Phase 1 - Risk Map & Layer Assignments

## RISK-RANKED TEST PRIORITY

Ranked by: likelihood of defect × cost of failure in production

| Rank | Feature                        | Risk Driver                                             | Test Depth Required           |
|------|--------------------------------|---------------------------------------------------------|-------------------------------|
| 1    | Vote idempotency               | Duplicate votes corrupt civic data; hard to detect      | Unit + Integration + E2E      |
| 2    | RBAC enforcement               | Privilege escalation — USER acting as ADMIN             | Unit + Integration (all routes)|
| 3    | Audit log immutability         | Regulatory requirement; silent failure possible         | Integration (trigger test)    |
| 4    | Redis flush worker correctness | Vote counts wrong if flush logic has delta errors       | Unit (flush math) + Integration|
| 5    | AES-256 roundtrip              | Corrupted email = user locked out permanently           | Unit (roundtrip + key rotation)|
| 6    | ISR cache invalidation         | Stale vote counts on public feed                        | Integration (ISR revalidation) |
| 7    | JWT tampering rejection        | Forged role claims bypass RBAC                          | Integration (all token variants)|
| 8    | Input validation (DTOs)        | Unsanitized input reaches service layer or DB           | Integration (boundary values)  |
| 9    | ProposalForm multi-step flow   | Broken validation blocks citizen submissions            | Component + E2E               |
| 10   | Rate limiting under load       | DDoS vector if Redis throttler not wired correctly      | Performance (load test)        |

## LAYER ASSIGNMENT

| Layer            | Framework             | Timeout   | Parallelism    | Runs in CI     |
|------------------|-----------------------|-----------|----------------|----------------|
| Unit             | Jest (--testPathPattern=unit) | 5s/test | Full parallel  | Every push     |
| Integration      | Jest (--testPathPattern=integration) | 30s/test | Per-file parallel | Every push |
| E2E              | Playwright            | 60s/test  | 2 workers      | Every push     |
| Performance      | k6                    | 5 min run | N/A            | Nightly        |
| Security         | Custom + OWASP ZAP    | 10 min    | N/A            | Nightly        |

## ASSUMPTIONS

1. **Keycloak** is not available in test environment. All JWT validation uses local signing key (`JWT_SECRET`) via `LocalJwtStrategy` activated when `NODE_ENV=test`
2. **Vote flush worker** cron interval is overridden in tests via `VOTE_FLUSH_INTERVAL_SECONDS=0` (flush on demand)
3. **Playwright tests** run against fully-booted `docker compose` stack, not mocked server
4. **All PII** in fixtures is synthetic (no real personal data)
5. **Test database** is `civic_test` separate from dev DB
6. **Redis** is flushed before each integration test run
7. **RabbitMQ** uses isolated test vhost

## CRITICAL TEST CONTRACTS

### Voting Service (Rank 1 - Highest Risk)
- `castVote()` must return 409 on duplicate vote attempt
- Redis counter must increment BEFORE RabbitMQ publish
- Transaction must rollback on publish failure

### RBAC (Rank 2)
- Every admin route must have 403 test for USER role
- Role hierarchy: ADMIN > MODERATOR > USER
- No route with @Roles() allows unauthenticated access

### Audit Log (Rank 3)
- INSERT allowed, UPDATE/DDELETE must throw at DB level
- FK SET NULL on actor_id when user deleted

### JWT (Rank 7)
- Test 7 tamper scenarios: wrong secret, expired, forged role, missing sub, malformed, no header, wrong signature algorithm

## COVERAGE THRESHOLDS

| Scope                         | Lines | Branches | Functions |
|-------------------------------|-------|----------|-----------|
| Backend service layer overall | ≥ 80% | ≥ 75%    | ≥ 80%     |
| VotingService                 | 100%  | 100%     | 100%      |
| EncryptionUtil                | 100%  | 100%     | 100%      |
| RolesGuard                    | 100%  | 100%     | 100%      |
| Frontend hooks                | ≥ 80% | ≥ 75%    | ≥ 80%     |
| Frontend organisms            | ≥ 75% | ≥ 70%    | ≥ 75%     |

## IMPLEMENTATION SEQUENCE

1. Create test directory structure
2. Setup Jest configs (unit, integration projects)
3. Setup Playwright config
4. Create test fixtures (identities.ts)
5. Create helpers (jwt.ts, api-client.ts, db.ts)
6. Write unit tests for critical paths
7. Write integration tests for all endpoints
8. Write E2E tests for critical flows
9. Configure CI pipeline