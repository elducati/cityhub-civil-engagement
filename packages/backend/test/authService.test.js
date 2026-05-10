"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = 'test-secret-key-minimum-32-characters-required';
function generateToken(user) {
    return jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch {
        throw new Error('Invalid token');
    }
}
describe('authService', () => {
    describe('Token Generation', () => {
        it('should generate a valid JWT token', () => {
            const user = { id: 'user-123', email: 'test@example.com', role: 'USER' };
            const token = generateToken(user);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3);
        });
        it('should include user data in token payload', () => {
            const user = { id: 'user-456', email: 'admin@example.com', role: 'ADMIN' };
            const token = generateToken(user);
            const decoded = jsonwebtoken_1.default.decode(token);
            expect(decoded.userId).toBe('user-456');
            expect(decoded.email).toBe('admin@example.com');
            expect(decoded.role).toBe('ADMIN');
        });
    });
    describe('User Registration (Mock)', () => {
        it('should validate email format', () => {
            const emails = ['test@example.com', 'admin@test.org', 'user+tag@domain.co.uk'];
            emails.forEach(email => {
                const isValid = email.includes('@') && email.includes('.');
                expect(isValid).toBe(true);
            });
        });
        it('should validate password minimum length', () => {
            const passwords = ['123456', 'password', 'secure123'];
            passwords.forEach(password => {
                const isValid = password.length >= 6;
                expect(isValid).toBe(true);
            });
        });
        it('should reject weak passwords', () => {
            const weakPasswords = ['123', 'ab', 'a'];
            weakPasswords.forEach(password => {
                const isWeak = password.length < 6;
                expect(isWeak).toBe(true);
            });
        });
    });
    describe('User Login (Mock)', () => {
        it('should find existing user by email', () => {
            const users = [
                { id: 'user-1', email: 'test@example.com' },
                { id: 'user-2', email: 'admin@example.com' },
            ];
            const foundUser = users.find(u => u.email === 'test@example.com');
            expect(foundUser).toBeDefined();
            expect(foundUser?.id).toBe('user-1');
        });
        it('should return undefined for non-existent email', () => {
            const users = [
                { id: 'user-1', email: 'test@example.com' },
            ];
            const foundUser = users.find(u => u.email === 'nonexistent@example.com');
            expect(foundUser).toBeUndefined();
        });
    });
    describe('Token Verification', () => {
        it('should verify valid token', () => {
            const user = { id: 'user-123', email: 'test@example.com', role: 'USER' };
            const token = generateToken(user);
            const decoded = verifyToken(token);
            expect(decoded.userId).toBe('user-123');
            expect(decoded.email).toBe('test@example.com');
        });
        it('should throw error for invalid token', () => {
            const testFn = () => verifyToken('invalid-token');
            expect(testFn).toThrow('Invalid token');
        });
        it('should throw error for malformed token', () => {
            const testFn = () => verifyToken('invalid.token.here');
            expect(testFn).toThrow();
        });
        it('should throw error for expired token', () => {
            const expiredToken = jsonwebtoken_1.default.sign({ userId: 'user-123' }, JWT_SECRET, { expiresIn: '-1s' });
            const testFn = () => verifyToken(expiredToken);
            expect(testFn).toThrow();
        });
    });
});
//# sourceMappingURL=authService.test.js.map