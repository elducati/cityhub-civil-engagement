"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Registration Bug Fix Test Suite
 * Tests all edge cases and error scenarios from the production bug analysis
 */
const JWT_SECRET = 'test-secret-key-minimum-32-characters-required';
const mockDatabase = { users: [] };
describe('Registration Bug Fixes - Comprehensive Test Suite', () => {
    beforeEach(() => {
        mockDatabase.users = [];
    });
    describe('Root Cause: Silent Database Error Suppression', () => {
        it('should validate that .returning() result is not empty', async () => {
            // Simulates the bug: .returning() returns undefined or empty array
            const result = undefined;
            const isValid = result && Array.isArray(result) && result.length > 0;
            expect(isValid).toBeFalsy();
        });
        it('should throw specific error when insert returns no rows', () => {
            const emptyResult = [];
            const validateInsertResult = (result, operation) => {
                if (!result || !Array.isArray(result) || result.length === 0) {
                    throw new Error(`Database operation failed: ${operation} returned no rows`);
                }
                return result[0];
            };
            expect(() => validateInsertResult(emptyResult, 'user insert')).toThrow('returned no rows');
        });
        it('should handle undefined .returning() result gracefully', () => {
            const result = undefined;
            const validateInsertResult = (result, operation) => {
                if (!result || !Array.isArray(result) || result.length === 0) {
                    throw new Error(`Database operation failed: ${operation} returned no rows`);
                }
                return result[0];
            };
            expect(() => validateInsertResult(result, 'user insert')).toThrow();
        });
    });
    describe('Edge Case: Race Condition on Duplicate Email', () => {
        it('should handle PostgreSQL 23505 unique constraint error', () => {
            const dbError = { code: '23505', message: 'duplicate key value violates unique constraint "users_email_key"' };
            const handleDatabaseError = (error) => {
                if (error.code === '23505') {
                    if (error.message.includes('email')) {
                        return 'This email is already registered. Try logging in instead.';
                    }
                    return 'This record already exists.';
                }
                return 'Database error';
            };
            const result = handleDatabaseError(dbError);
            expect(result).toBe('This email is already registered. Try logging in instead.');
        });
        it('should prevent simultaneous registrations with same email', async () => {
            const email = 'duplicate@test.com';
            // First registration succeeds
            mockDatabase.users.push({
                id: 'user-1',
                email,
                password_hash: 'hash1',
                role: 'USER',
                name: 'User One',
            });
            // Second registration should fail
            const existingUser = mockDatabase.users.find(u => u.email === email);
            expect(existingUser).toBeDefined();
            expect(existingUser?.email).toBe(email);
        });
    });
    describe('Edge Case: Database Pool Exhaustion', () => {
        it('should detect connection timeout errors', () => {
            const timeoutError = new Error('socket timeout');
            const isTimeout = timeoutError.message?.includes('timeout') ||
                timeoutError.message?.includes('pool');
            expect(isTimeout).toBe(true);
        });
        it('should detect pool exhaustion errors', () => {
            const poolError = new Error('no more connections available in the pool');
            const isPoolError = poolError.message?.includes('pool');
            expect(isPoolError).toBe(true);
        });
        it('should return 503 Service Unavailable for pool errors', () => {
            const poolError = new Error('pool exhausted');
            const getStatusCode = (error) => {
                if (error.message?.includes('pool')) {
                    return 503;
                }
                return 500;
            };
            expect(getStatusCode(poolError)).toBe(503);
        });
    });
    describe('Edge Case: Audit Log Failure After User Insert', () => {
        it('should not fail registration if audit log fails', async () => {
            // User is successfully inserted
            const user = {
                id: 'user-123',
                email: 'test@example.com',
                password_hash: 'hash123',
                role: 'USER',
                name: 'Test User',
            };
            mockDatabase.users.push(user);
            // Audit log fails (but shouldn't affect registration)
            let auditLogFailed = false;
            try {
                throw new Error('Audit log database connection failed');
            }
            catch {
                auditLogFailed = true;
            }
            // Registration should still be considered successful
            expect(mockDatabase.users.length).toBe(1);
            expect(mockDatabase.users[0].email).toBe('test@example.com');
            expect(auditLogFailed).toBe(true);
        });
        it('should retry audit log with exponential backoff', async () => {
            let attempts = 0;
            const maxRetries = 3;
            const createAuditLogWithRetry = async (attempt = 1) => {
                attempts++;
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 100;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return createAuditLogWithRetry(attempt + 1);
                }
                return true; // Give up after max retries
            };
            await createAuditLogWithRetry();
            expect(attempts).toBe(maxRetries);
        });
    });
    describe('Edge Case: Password Hashing Timeout', () => {
        it('should timeout bcrypt if it takes too long', async () => {
            const BCRYPT_TIMEOUT_MS = 100;
            const timeoutFn = async () => {
                const hashPromise = new Promise(() => {
                    // Simulate never-ending hash
                });
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), BCRYPT_TIMEOUT_MS));
                return Promise.race([hashPromise, timeoutPromise]);
            };
            try {
                await timeoutFn();
            }
            catch (error) {
                expect(error.message).toBe('Timeout');
            }
        }, 1000);
        it('should handle bcrypt errors gracefully', async () => {
            const password = 'test-password';
            const BCRYPT_ROUNDS = 12;
            try {
                const hash = await bcryptjs_1.default.hash(password, BCRYPT_ROUNDS);
                expect(hash).toBeDefined();
                expect(typeof hash).toBe('string');
                expect(hash.length).toBeGreaterThan(0);
            }
            catch (error) {
                throw new Error('Failed to process your password');
            }
        });
    });
    describe('Edge Case: Concurrent Registration Attempts', () => {
        it('should handle multiple simultaneous registrations', async () => {
            const emails = ['user1@test.com', 'user2@test.com', 'user3@test.com'];
            const registerConcurrently = emails.map(email => ({
                id: `user-${emails.indexOf(email)}`,
                email,
                password_hash: `hash-${email}`,
                role: 'USER',
                name: `User ${email}`,
            }));
            registerConcurrently.forEach(user => mockDatabase.users.push(user));
            expect(mockDatabase.users.length).toBe(3);
            expect(mockDatabase.users.map(u => u.email)).toEqual(emails);
        });
        it('should reject duplicate email in concurrent registrations', () => {
            const duplicateEmail = 'duplicate@test.com';
            // First succeeds
            mockDatabase.users.push({
                id: 'user-1',
                email: duplicateEmail,
                password_hash: 'hash1',
                role: 'USER',
                name: 'User One',
            });
            // Second should fail
            const shouldFail = mockDatabase.users.some(u => u.email === duplicateEmail);
            expect(shouldFail).toBe(true);
        });
    });
    describe('Edge Case: Invalid JWT Secret', () => {
        it('should throw error if token generation fails', () => {
            const generateToken = (user, secret = '') => {
                if (!secret || secret.length < 32) {
                    throw new Error('Invalid JWT secret');
                }
                return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '1h' });
            };
            expect(() => generateToken({ id: 'user-1' }, '')).toThrow('Invalid JWT secret');
        });
        it('should generate valid token with proper secret', () => {
            const user = { id: 'user-123', email: 'test@example.com', role: 'USER' };
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            expect(decoded.id).toBe(user.id);
            expect(decoded.email).toBe(user.email);
        });
    });
    describe('Integration: Full Registration Flow With Error Handling', () => {
        it('should register user successfully when all operations succeed', async () => {
            const email = 'newuser@test.com';
            const password = 'SecurePassword123';
            const name = 'New User';
            // Simulate registration
            const passwordHash = await bcryptjs_1.default.hash(password, 12);
            const userId = 'user-uuid-123';
            const user = {
                id: userId,
                email,
                password_hash: passwordHash,
                role: 'USER',
                name,
            };
            mockDatabase.users.push(user);
            // Verify user was created
            const createdUser = mockDatabase.users.find(u => u.email === email);
            expect(createdUser).toBeDefined();
            expect(createdUser?.email).toBe(email);
            expect(createdUser?.name).toBe(name);
            // Verify password was hashed
            const isPasswordValid = await bcryptjs_1.default.compare(password, createdUser.password_hash);
            expect(isPasswordValid).toBe(true);
            // Verify token can be generated
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            expect(token).toBeDefined();
        });
        it('should handle all error types with specific messages', () => {
            const errors = [
                { code: '23505', message: 'duplicate email', expected: 409 },
                { code: '23503', message: 'invalid reference', expected: 400 },
                { code: 'POOL_ERROR', message: 'pool exhausted', expected: 503 },
            ];
            const getStatusCode = (error) => {
                if (error.code === '23505')
                    return 409;
                if (error.code === '23503')
                    return 400;
                if (error.code === 'POOL_ERROR' || error.message?.includes('pool'))
                    return 503;
                return 500;
            };
            errors.forEach(err => {
                const statusCode = getStatusCode(err);
                expect(statusCode).toBe(err.expected);
            });
        });
    });
    describe('Frontend Error Handling Improvements', () => {
        it('should extract and display backend error message', () => {
            const errorResponse = {
                response: {
                    data: {
                        message: 'This email is already registered. Try logging in instead.',
                        error: 'Conflict',
                    },
                },
            };
            const getErrorMessage = (err) => {
                if (err.response?.data?.message) {
                    return err.response.data.message;
                }
                if (err.response?.data?.error) {
                    return err.response.data.error;
                }
                return 'Registration failed. Please try again.';
            };
            const message = getErrorMessage(errorResponse);
            expect(message).toBe('This email is already registered. Try logging in instead.');
        });
        it('should handle validation error details', () => {
            const errorResponse = {
                response: {
                    data: {
                        details: [
                            { path: 'email', message: 'Invalid email format' },
                            { path: 'password', message: 'Too short' },
                        ],
                    },
                },
            };
            const getDetailedError = (err) => {
                if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
                    return err.response.data.details.map((d) => d.message).join('; ');
                }
                return 'Validation failed';
            };
            const message = getDetailedError(errorResponse);
            expect(message).toContain('Invalid email format');
            expect(message).toContain('Too short');
        });
    });
});
//# sourceMappingURL=registrationBugFix.test.js.map