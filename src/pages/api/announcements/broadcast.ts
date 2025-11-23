import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, extractMeta } from '../_utils/auth';
import { setServiceHeader, validateMethod, handleApiError } from '../_utils/apiHelpers';
import { HttpMemberDirectoryClient } from '../../../infrastructure/memberDirectoryClient';
import { broadcastAnnouncement } from '../../../application/broadcastAnnouncement';

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  setServiceHeader(res);
  if (!validateMethod(req, res, 'POST')) return;
  if (!requireAuth(req, res)) return;

  try {
    const meta = extractMeta(req);
    const result = await broadcastAnnouncement(
      { ...req.body, ...meta },
      new HttpMemberDirectoryClient()
    );
    res.status(200).json({ requestId: meta.correlationId, ...result });
  } catch (e: any) {
    handleApiError(e, res);
  }
}

export default handler;
