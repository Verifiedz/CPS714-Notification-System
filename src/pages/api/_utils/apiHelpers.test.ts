import { setServiceHeader, validateMethod, handleApiError } from './apiHelpers';
import type { NextApiRequest, NextApiResponse } from 'next';

describe('apiHelpers', () => {
  let mockRes: Partial<NextApiResponse>;
  let mockReq: Partial<NextApiRequest>;

  beforeEach(() => {
    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockReq = {
      method: 'POST',
    };
  });

  describe('setServiceHeader', () => {
    it('should set X-Service header to Fithub', () => {
      setServiceHeader(mockRes as NextApiResponse);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Service', 'Fithub');
    });
  });

  describe('validateMethod', () => {
    it('should return true for matching method', () => {
      mockReq.method = 'POST';

      const result = validateMethod(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        'POST'
      );

      expect(result).toBe(true);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return false and send 405 for non-matching method', () => {
      mockReq.method = 'GET';

      const result = validateMethod(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        'POST'
      );

      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'METHOD_NOT_ALLOWED' });
    });
  });

  describe('handleApiError', () => {
    it('should send 400 for VALIDATION_ERROR', () => {
      const error = new Error('VALIDATION_ERROR: Invalid input');

      handleApiError(error, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'VALIDATION_ERROR: Invalid input',
      });
    });

    it('should send 413 for TOO_MANY_TARGETS', () => {
      const error = new Error('TOO_MANY_TARGETS');

      handleApiError(error, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(413);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'TOO_MANY_TARGETS' });
    });

    it('should send 500 for other errors', () => {
      const error = new Error('Database connection failed');

      handleApiError(error, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Database connection failed',
      });
    });

    it('should handle unknown error with default message', () => {
      const error = { message: null };

      handleApiError(error, mockRes as NextApiResponse);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'UNKNOWN_ERROR' });
    });
  });
});
