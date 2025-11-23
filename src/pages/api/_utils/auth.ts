import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { config } from '../../../shared/config';

/**
 * Compares two strings in constant time to prevent timing attacks
 * Critical for security when comparing secrets or signatures
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 */
function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Verifies HMAC signature for request authentication
 * Signature format: hex(HMAC_SHA256(X-Timestamp + "." + JSON.stringify(body)))
 * Uses timing-safe comparison to prevent timing attacks
 * @param req - Next.js API request with headers X-Timestamp and X-Signature
 * @returns true if signature is valid, false otherwise
 */
export function verifyHmac(req: NextApiRequest) {
  const secret = config.hmacSecret;
  if (!secret) return false;

  const ts = String(req.headers['x-timestamp'] || '');
  const sig = String(req.headers['x-signature'] || '');
  const body = JSON.stringify(req.body || {});
  const h = crypto.createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex');
  return safeEqual(h, sig);
}

/**
 * Validates static API key from request headers
 * @param req - Next.js API request with header X-API-Key
 * @returns true if API key matches configured key, false otherwise
 */
export function isApiKeyValid(req: NextApiRequest) {
  const key = String(req.headers['x-api-key'] || '');
  return !!config.apiKey && key === config.apiKey;
}

/**
 * Authenticates request using HMAC signature or API key
 * Prefers HMAC verification if secret is configured, otherwise falls back to API key
 * Sends 401 response if authentication fails
 * @param req - Next.js API request
 * @param res - Next.js API response
 * @returns true if authenticated, false if authentication failed (response already sent)
 */
export function requireAuth(req: NextApiRequest, res: NextApiResponse): boolean {
  // Prefer HMAC if configured, otherwise fall back to static API key.
  if (config.hmacSecret) {
    if (!verifyHmac(req)) {
      res.status(401).json({ error: 'BAD_SIGNATURE' });
      return false;
    }
    return true;
  }
  if (!isApiKeyValid(req)) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return false;
  }
  return true;
}

/**
 * Extracts metadata from request headers for tracking and idempotency
 * Generates correlation ID if not provided for request tracing
 * @param req - Next.js API request
 * @returns Object with correlationId and optional idempotencyKey
 */
export function extractMeta(req: NextApiRequest) {
  const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  const idempotencyKey = (req.headers['idempotency-key'] as string) || undefined;
  return { correlationId, idempotencyKey };
}
