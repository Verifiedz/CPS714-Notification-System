import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Service', 'Fithub');
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }
  res.status(200).json({
    service: 'Fithub',
    endpoints: [
      { method: 'POST', path: '/api/notifications/send', description: 'Send a single notification' }
    ]
  });
}
