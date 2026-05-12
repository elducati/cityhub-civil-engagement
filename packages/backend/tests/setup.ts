process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6380';
process.env.RABBITMQ_URL = 'amqp://test:test@localhost:5673';
process.env.AUTH_JWT_SECRET = 'test-jwt-secret-key-for-testing-min-32-chars!';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars!!';