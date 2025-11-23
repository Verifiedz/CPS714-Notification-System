import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Service', 'Fithub');
  res.status(200).json({
    status: 'ok',
    uptimeSec: process.uptime(),
    now: new Date().toISOString(),
  });
}
