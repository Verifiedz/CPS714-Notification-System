import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Sets the common X-Service header on the response
 * @param res - Next.js API response object
 */
export function setServiceHeader(res: NextApiResponse): void {
  res.setHeader('X-Service', 'Fithub');
}

/**
 * Validates that the request method matches the expected method
 * Returns true if valid, sends 405 error and returns false if invalid
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @param expectedMethod - The expected HTTP method (GET, POST, etc.)
 * @returns true if method is valid, false otherwise
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
 * - VALIDATION_ERROR: 400
 * - TOO_MANY_TARGETS: 413
 * - Other errors: 500
 * @param e - The error object
 * @param res - Next.js API response object
 */
export function handleApiError(e: any, res: NextApiResponse): void {
  const msg = String(e?.message || 'UNKNOWN_ERROR');
  const status =
    msg.startsWith('VALIDATION_ERROR') ? 400 :
    msg === 'TOO_MANY_TARGETS' ? 413 :
    500;
  res.status(status).json({ error: msg });
}
