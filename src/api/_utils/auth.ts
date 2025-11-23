import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { config } from '../../shared/config';

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * HMAC: hex( HMAC_SHA256( X-Timestamp + "." + JSON.stringify(body) ) )
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

export function isApiKeyValid(req: NextApiRequest) {
  const key = String(req.headers['x-api-key'] || '');
  return !!config.apiKey && key === config.apiKey;
}

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

export function extractMeta(req: NextApiRequest) {
  const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  const idempotencyKey = (req.headers['idempotency-key'] as string) || undefined;
  return { correlationId, idempotencyKey };
}
