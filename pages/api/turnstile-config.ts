
import type { NextApiRequest, NextApiResponse } from 'next';

type TurnstileConfig = {
  siteKey?: string;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TurnstileConfig>
) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  const siteKey = process.env.TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return res.status(503).json({
      error: 'Turnstile is not configured',
    });
  }

  return res.status(200).json({ siteKey });
}
