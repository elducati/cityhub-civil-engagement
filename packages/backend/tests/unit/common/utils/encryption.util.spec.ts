/**
 * Unit Tests - EncryptionUtil
 * Tests AES-256 encryption/decryption with random IV
 */

const TEST_KEY = process.env.ENCRYPTION_KEY || 'test-encryption-key-32-chars!!';

describe('EncryptionUtil', () => {
  describe('encrypt()', () => {
    it('produces a ciphertext that is different from the plaintext input', async () => {
      const { encrypt } = await import('../../../../src/utils/encryption');
      const plaintext = 'test@example.com';
      const ciphertext = encrypt(plaintext, TEST_KEY);
      
      expect(ciphertext).not.toBe(plaintext);
      expect(ciphertext.length).toBeGreaterThan(plaintext.length);
    });

    it('produces ciphertext with expected format (iv:tag:ciphertext)', async () => {
      const { encrypt } = await import('../../../../src/utils/encryption');
      const plaintext = 'test@example.com';
      const result = encrypt(plaintext, TEST_KEY);
      
      expect(result).toContain(':');
      const parts = result.split(':');
      expect(parts.length).toBe(3);
    });
  });

  describe('decrypt()', () => {
    it('decrypt(encrypt(x)) returns the original plaintext exactly', async () => {
      const { encrypt, decrypt } = await import('../../../../src/utils/encryption');
      const plaintext = 'test@example.com';
      const ciphertext = encrypt(plaintext, TEST_KEY);
      const decrypted = decrypt(ciphertext, TEST_KEY);
      
      expect(decrypted).toBe(plaintext);
    });

    it('handles unicode characters correctly in the roundtrip', async () => {
      const { encrypt, decrypt } = await import('../../../../src/utils/encryption');
      const plaintext = '用户@example.com';
      const ciphertext = encrypt(plaintext, TEST_KEY);
      const decrypted = decrypt(ciphertext, TEST_KEY);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('random IV generation', () => {
    it('produces a different ciphertext on every call for the same plaintext', async () => {
      const { encrypt, decrypt } = await import('../../../../src/utils/encryption');
      const plaintext = 'same@example.com';
      
      const ciphertext1 = encrypt(plaintext, TEST_KEY);
      const ciphertext2 = encrypt(plaintext, TEST_KEY);
      const ciphertext3 = encrypt(plaintext, TEST_KEY);
      
      expect(ciphertext1).not.toBe(ciphertext2);
      expect(ciphertext2).not.toBe(ciphertext3);
      
      expect(decrypt(ciphertext1, TEST_KEY)).toBe(plaintext);
      expect(decrypt(ciphertext2, TEST_KEY)).toBe(plaintext);
      expect(decrypt(ciphertext3, TEST_KEY)).toBe(plaintext);
    });
  });

  describe('tamper resistance', () => {
    it('throws when given a tampered ciphertext', async () => {
      const { encrypt, decrypt } = await import('../../../../src/utils/encryption');
      const plaintext = 'test@example.com';
      const ciphertext = encrypt(plaintext, TEST_KEY);
      
      const tamperedCiphertext = ciphertext.slice(0, -2) + 'XX';
      
      expect(() => decrypt(tamperedCiphertext, TEST_KEY)).toThrow();
    });

    it('throws when given an empty string', async () => {
      const { decrypt } = await import('../../../../src/utils/encryption');
      expect(() => decrypt('', TEST_KEY)).toThrow();
    });

    it('throws when given a malformed string', async () => {
      const { decrypt } = await import('../../../../src/utils/encryption');
      expect(() => decrypt('not-a-valid-format', TEST_KEY)).toThrow();
    });
  });
});