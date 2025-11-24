import type { NextApiRequest, NextApiResponse } from 'next';

/**
 set header for service
 */
export function setServiceHeader(res: NextApiResponse): void {
  res.setHeader('X-Service', 'Fithub');
}

/**
 * Validates that the request method matches the expected method
 * Returns true if valid
 */
export function validateMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  expectedMethod: string
): boolean {
  if (req.method !== expectedMethod) {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return false;
  }
  return true;
}

/**
 * Handles API errors by determining appropriate status code and sending response
 * Error handling logic for all generic status codes
 */
export function handleApiError(e: any, res: NextApiResponse): void {
  const msg = String(e?.message || 'UNKNOWN_ERROR');
  const status =
    msg.startsWith('VALIDATION_ERROR') ? 400 :
    msg === 'TOO_MANY_TARGETS' ? 413 :
    500;
  res.status(status).json({ error: msg });
}
