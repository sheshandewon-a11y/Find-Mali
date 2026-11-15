import type { NextApiRequest, NextApiResponse } from 'next';

type Health = { status: 'ok'; app: 'find-mali'; mode: 'frontend-demo'; emailBackend: 'disabled'; timestamp: string };

export default function handler(_req: NextApiRequest, res: NextApiResponse<Health>) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ status: 'ok', app: 'find-mali', mode: 'frontend-demo', emailBackend: 'disabled', timestamp: new Date().toISOString() });
}
