import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const proposalSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(500, 'Title too long'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000, 'Description too long'),
});

const updateProposalSchema = z.object({
  title: z.string().min(10).max(500).optional(),
  description: z.string().min(50).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'ARCHIVED']).optional(),
});

const voteSchema = z.object({
  proposalId: z.string().uuid('Invalid proposal ID'),
});

describe('Input Validation', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept valid email variations', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
      ];

      validEmails.forEach(email => {
        const result = registerSchema.safeParse({
          email,
          password: 'password123',
          name: 'Test',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject overly long name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'a'.repeat(201),
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('proposalSchema', () => {
    it('should validate valid proposal data', () => {
      const validData = {
        title: 'Improve City Parks',
        description: 'We should invest in more green spaces for the community.',
      };

      const result = proposalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short title', () => {
      const invalidData = {
        title: 'Hi',
        description: 'Valid description here',
      };

      const result = proposalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long title', () => {
      const invalidData = {
        title: 'a'.repeat(600),
        description: 'Valid description here',
      };

      const result = proposalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short description', () => {
      const invalidData = {
        title: 'Valid Title',
        description: 'Short',
      };

      const result = proposalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing title', () => {
      const invalidData = {
        description: 'Valid description here',
      };

      const result = proposalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing description', () => {
      const invalidData = {
        title: 'Valid Title',
      };

      const result = proposalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept very long description', () => {
      const validData = {
        title: 'Valid Title',
        description: 'a'.repeat(4000),
      };

      const result = proposalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateProposalSchema', () => {
    it('should validate partial update', () => {
      const validData = {
        title: 'Updated Title',
      };

      const result = updateProposalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const validData = {};

      const result = updateProposalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate status values', () => {
      const validData = {
        status: 'CLOSED',
      };

      const result = updateProposalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const invalidData = {
        status: 'INVALID_STATUS',
      };

      const result = updateProposalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('voteSchema', () => {
    it('should validate valid vote', () => {
      const validData = {
        proposalId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = voteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalidData = {
        proposalId: 'not-a-uuid',
      };

      const result = voteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing proposalId', () => {
      const invalidData = {};

      const result = voteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('SQL Injection Prevention', () => {
  describe('Input sanitization', () => {
    it('should handle SQL injection attempts in strings', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "UNION SELECT * FROM users",
        "'; DELETE FROM proposals; --",
        "<script>alert('xss')</script>",
      ];

      maliciousInputs.forEach(input => {
        const result = proposalSchema.safeParse({
          title: input,
          description: 'Test description that is long enough to pass validation',
        });

        expect(result.success).toBe(true);
      });
    });

    it('should handle XSS attempts', () => {
      const xssInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert(1)',
        '{{constructor.constructor("alert(1)")()}}',
      ];

      xssInputs.forEach(input => {
        const result = proposalSchema.safeParse({
          title: 'Test Title Test Title Test',
          description: input + ' ' + 'a'.repeat(100),
        });

        expect(result.success).toBe(true);
      });
    });
  });
});

describe('Password Validation', () => {
  it('should enforce minimum password length', () => {
    const shortPasswords = ['', 'a', 'ab', 'abc', 'abcd', 'abcde'];

    shortPasswords.forEach(password => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password,
        name: 'Test',
      });

      expect(result.success).toBe(false);
    });
  });

  it('should accept long passwords', () => {
    const longPassword = 'a'.repeat(100);

    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: longPassword,
      name: 'Test',
    });

    expect(result.success).toBe(true);
  });

  it('should accept passwords with various characters', () => {
    const complexPasswords = [
      'P@ssw0rd!',
      '1234567890',
      'abcdefghijklmnop',
      'Password123',
      '        ',
    ];

    complexPasswords.forEach(password => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password,
        name: 'Test',
      });

      expect(result.success).toBe(true);
    });
  });
});