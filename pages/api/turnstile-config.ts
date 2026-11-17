
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const siteKey = process.env.TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return res.status(503).json({
      success: false,
      message: 'Turnstile is not configured',
    });
  }

  return res.status(200).json({
    success: true,
    siteKey,
  });
}
