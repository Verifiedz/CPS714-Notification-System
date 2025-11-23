import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, extractMeta } from '../_utils/auth';
import { setServiceHeader, validateMethod, handleApiError } from '../_utils/apiHelpers';
import { sendNotification } from '../../application/sendNotification';

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  setServiceHeader(res);
  if (!validateMethod(req, res, 'POST')) return;
  if (!requireAuth(req, res)) return;

  try {
    const meta = extractMeta(req);
    const { results } = await sendNotification({ ...req.body, ...meta });
    res.status(200).json({ requestId: meta.correlationId, results });
  } catch (e: any) {
    handleApiError(e, res);
  }
}

export default handler;
