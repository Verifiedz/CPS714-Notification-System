import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, extractMeta } from '../_utils/auth';
import { SendgridEmailProvider } from '../../infrastructure/emailProvider';
import { TwilioSmsProvider } from '../../infrastructure/smsProvider';
import { sendNotification } from '../../application/sendNotification';

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Service', 'Fithub');
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  if (!requireAuth(req, res)) return;

  try {
    const meta = extractMeta(req);
    const { results } = await sendNotification(
      { ...req.body, ...meta },
      { email: new SendgridEmailProvider(), sms: new TwilioSmsProvider() }
    );
    res.status(200).json({ requestId: meta.correlationId, results });
  } catch (e: any) {
    const msg = String(e?.message || 'UNKNOWN');
    const status = msg.startsWith('VALIDATION') ? 400 : 500;
    res.status(status).json({ error: msg });
  }
}

export default handler;
