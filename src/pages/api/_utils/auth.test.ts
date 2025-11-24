import { isApiKeyValid, requireAuth, extractMeta } from './auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { config } from '../../../shared/config';

describe('auth', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    mockReq = {
      headers: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('requireAuth', () => {
    const originalApiKey = config.apiKey;

    afterEach(() => {
      (config as any).apiKey = originalApiKey;
    });

    it('should return true when API key is valid', () => {
      (config as any).apiKey = 'valid-key';

      mockReq.headers = {
        'x-api-key': 'valid-key',
      };

      const result = requireAuth(mockReq as NextApiRequest, mockRes as NextApiResponse);
      expect(result).toBe(true);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return false when API key is invalid', () => {
      (config as any).apiKey = 'valid-key';

      mockReq.headers = {
        'x-api-key': 'wrong-key',
      };

      const result = requireAuth(mockReq as NextApiRequest, mockRes as NextApiResponse);
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'UNAUTHORIZED' });
    });
  });

  describe('isApiKeyValid', () => {
    const originalApiKey = config.apiKey;

    beforeEach(() => {
      (config as any).apiKey = 'test-api-key-123';
    });

    afterEach(() => {
      (config as any).apiKey = originalApiKey;
    });

    it('should return true for valid API key', () => {
      mockReq.headers = {
        'x-api-key': 'test-api-key-123',
      };

      const result = isApiKeyValid(mockReq as NextApiRequest);
      expect(result).toBe(true);
    });

    it('should return false for invalid API key', () => {
      mockReq.headers = {
        'x-api-key': 'wrong-key',
      };

      const result = isApiKeyValid(mockReq as NextApiRequest);
      expect(result).toBe(false);
    });

    it('should return false if API key header is missing', () => {
      mockReq.headers = {};

      const result = isApiKeyValid(mockReq as NextApiRequest);
      expect(result).toBe(false);
    });

    it('should return false if config API key is not set', () => {
      (config as any).apiKey = '';
      mockReq.headers = {
        'x-api-key': 'any-key',
      };

      const result = isApiKeyValid(mockReq as NextApiRequest);
      expect(result).toBe(false);
    });
  });

  describe('extractMeta', () => {
    it('should extract correlation ID from headers', () => {
      mockReq.headers = {
        'x-correlation-id': 'corr-123',
      };

      const meta = extractMeta(mockReq as NextApiRequest);
      expect(meta.correlationId).toBe('corr-123');
    });

    it('should generate correlation ID if not provided', () => {
      mockReq.headers = {};

      const meta = extractMeta(mockReq as NextApiRequest);
      expect(meta.correlationId).toBeDefined();
      expect(meta.correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      ); // UUID format
    });

    it('should extract idempotency key from headers', () => {
      mockReq.headers = {
        'idempotency-key': 'idem-456',
      };

      const meta = extractMeta(mockReq as NextApiRequest);
      expect(meta.idempotencyKey).toBe('idem-456');
    });

    it('should leave idempotency key undefined if not provided', () => {
      mockReq.headers = {};

      const meta = extractMeta(mockReq as NextApiRequest);
      expect(meta.idempotencyKey).toBeUndefined();
    });

    it('should extract both correlation ID and idempotency key', () => {
      mockReq.headers = {
        'x-correlation-id': 'corr-789',
        'idempotency-key': 'idem-789',
      };

      const meta = extractMeta(mockReq as NextApiRequest);
      expect(meta.correlationId).toBe('corr-789');
      expect(meta.idempotencyKey).toBe('idem-789');
    });
  });
});
