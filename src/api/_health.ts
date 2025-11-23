import type { NextApiRequest, NextApiResponse } from 'next';
import { setServiceHeader } from './_utils/apiHelpers';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  setServiceHeader(res);
  res.status(200).json({
    status: 'ok',
    uptimeSec: process.uptime(),
    now: new Date().toISOString(),
  });
}
