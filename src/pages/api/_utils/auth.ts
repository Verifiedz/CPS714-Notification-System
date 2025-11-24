import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { config } from '../../../shared/config';



/**
 * Validates static API key from request headers
 */
export function isApiKeyValid(req: NextApiRequest) {
  const key = String(req.headers['x-api-key'] || '');
  return !!config.apiKey && key === config.apiKey;
}

/**
 * Authenticates request using API key
 * Sends 401 response if authentication fails
 * Authenticates services that are granted acccess to service (Booking, Payment, Admin)
 */
export function requireAuth(req: NextApiRequest, res: NextApiResponse): boolean {
  if (!isApiKeyValid(req)) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return false;
  }
  return true;
}

/**
 * Extracts metadata from request headers for tracking and idempotency
 * Generates correlation ID if not provided for request tracing
 */
export function extractMeta(req: NextApiRequest) {
  const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  const idempotencyKey = (req.headers['idempotency-key'] as string) || undefined;
  return { correlationId, idempotencyKey };
}
