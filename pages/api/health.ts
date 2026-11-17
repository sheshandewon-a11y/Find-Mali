
import type { NextApiRequest, NextApiResponse } from 'next';

type Health = {
  status: 'ok';
  app: 'find-mali';
  mode: 'production';
  emailBackend: 'supabase-configured' | 'not-configured';
  timestamp: string;
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Health>
) {
  res.setHeader('Cache-Control', 'no-store');

  const emailBackend = process.env.SUPABASE_PUBLISHABLE_KEY
    ? 'supabase-configured'
    : 'not-configured';

  return res.status(200).json({
    status: 'ok',
    app: 'find-mali',
    mode: 'production',
    emailBackend,
    timestamp: new Date().toISOString(),
  });
}
