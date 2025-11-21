import { createRequest, createResponse } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

vi.mock('../../../src/application/broadcastAnnouncement', () => ({
  broadcastAnnouncement: vi.fn(async (_body) => ({
    dryRun: true,
    targets: 42,
    sample: [{ email: 'a@x.com' }],
  })),
}));

import handler from '../../../src/api/announcements/broadcast';
import { config } from '../../../src/shared/config';
import { broadcastAnnouncement } from '../../../src/application/broadcastAnnouncement';

function sign(secret: string, ts: string, body: any) {
  const payload = `${ts}.${JSON.stringify(body)}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

describe('POST /api/announcements/broadcast', () => {
  const baseBody = {
    message: 'Pool closed for maintenance',
    channels: ['EMAIL'],
    audience: { segment: 'ALL_MEMBERS' },
    dryRun: true,
  };

  beforeEach(() => {
    (config as any).hmacSecret = 'testsecret';
    (config as any).apiKey = '';
  });

  it('401 on bad signature', async () => {
    const req = createRequest<NextApiRequest>({
      method: 'POST',
      headers: { 'x-timestamp': '123', 'x-signature': 'nope' },
      body: baseBody,
    });
    const res = createResponse<NextApiResponse>();
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it('200 dryRun result', async () => {
    const ts = String(Date.now());
    const sig = sign(config.hmacSecret, ts, baseBody);
    const req = createRequest<NextApiRequest>({
      method: 'POST',
      headers: { 'x-timestamp': ts, 'x-signature': sig },
      body: baseBody,
    });
    const res = createResponse<NextApiResponse>();
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const payload = JSON.parse(res._getData());
    expect(payload.dryRun).toBe(true);
    expect(payload.targets).toBe(42);
    expect(broadcastAnnouncement).toHaveBeenCalled();
  });

  it('maps TOO_MANY_TARGETS to 413', async () => {
    (broadcastAnnouncement as unknown as vi.Mock).mockImplementationOnce(async () => {
      throw new Error('TOO_MANY_TARGETS');
    });
    const ts = String(Date.now());
    const sig = sign(config.hmacSecret, ts, baseBody);
    const req = createRequest<NextApiRequest>({
      method: 'POST',
      headers: { 'x-timestamp': ts, 'x-signature': sig },
      body: baseBody,
    });
    const res = createResponse<NextApiResponse>();
    await handler(req, res);
    expect(res._getStatusCode()).toBe(413);
    expect(JSON.parse(res._getData())).toEqual({ error: 'TOO_MANY_TARGETS' });
  });
});
