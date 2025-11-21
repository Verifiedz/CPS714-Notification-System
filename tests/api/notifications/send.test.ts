import { createRequest, createResponse } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

vi.mock('../../../src/application/sendNotification', () => ({
  sendNotification: vi.fn(async () => ({
    results: { EMAIL: { status: 'SENT', providerMessageId: 'id-1' } },
  })),
}));

import handler from '../../../src/api/notifications/send';
import { config } from '../../../src/shared/config';
import { sendNotification } from '../../../src/application/sendNotification';

function sign(secret: string, ts: string, body: any) {
  const payload = `${ts}.${JSON.stringify(body)}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

describe('POST /api/notifications/send', () => {
  const baseBody = {
    recipient: { email: 'user@example.com' },
    channels: ['EMAIL'],
    template: 'BOOKING_CONFIRMATION',
    variables: { bookingId: 'bk_123', className: 'Spin', startTime: '2025-11-14T10:00:00Z' },
  };

  beforeEach(() => {
    (config as any).hmacSecret = 'testsecret';
    (config as any).apiKey = '';
  });

  it('rejects non-POST', async () => {
    const req = createRequest<NextApiRequest>({ method: 'GET' });
    const res = createResponse<NextApiResponse>();
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it('401 on bad signature', async () => {
    const req = createRequest<NextApiRequest>({
      method: 'POST',
      headers: { 'x-timestamp': '123', 'x-signature': 'bad' },
      body: baseBody,
    });
    const res = createResponse<NextApiResponse>();
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ error: 'BAD_SIGNATURE' });
  });

  it('200 on valid request with HMAC', async () => {
    const ts = String(Date.now());
    const sig = sign(config.hmacSecret, ts, baseBody);
    const req = createRequest<NextApiRequest>({
      method: 'POST',
      headers: { 'x-timestamp': ts, 'x-signature': sig, 'idempotency-key': 'idem-1' },
      body: baseBody,
    });
    const res = createResponse<NextApiResponse>();
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const payload = JSON.parse(res._getData());
    expect(payload.results.EMAIL.status).toBe('SENT');
    expect(sendNotification).toHaveBeenCalled();
  });

  it('maps validation errors to 400', async () => {
    (sendNotification as unknown as vi.Mock).mockImplementationOnce(async () => {
      throw new Error('VALIDATION: channels required');
    });

    const ts = String(Date.now());
    const sig = sign(config.hmacSecret, ts, { ...baseBody, channels: [] });

    const req = createRequest<NextApiRequest>({
      method: 'POST',
      headers: { 'x-timestamp': ts, 'x-signature': sig },
      body: { ...baseBody, channels: [] },
    });
    const res = createResponse<NextApiResponse>();
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });
});
