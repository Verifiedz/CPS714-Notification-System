import type { NextApiRequest, NextApiResponse } from 'next';
import { setServiceHeader, validateMethod } from '../_utils/apiHelpers';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  setServiceHeader(res);
  if (!validateMethod(req, res, 'GET')) return;

  res.status(200).json({
    service: 'Fithub',
    endpoints: [
      { method: 'POST', path: '/api/notifications/send', description: 'Send a single notification' }
    ]
  });
}
