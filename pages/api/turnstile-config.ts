import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const token = req.body?.token;

  if (typeof token !== 'string' || !token.trim()) {
    return res.status(400).json({
      success: false,
      message: 'CAPTCHA token is required',
    });
  }

  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return res.status(503).json({
      success: false,
      message: 'Supabase configuration is missing',
    });
  }

  try {
    const response = await fetch(
      'https://xzfefaepyjgnwhcvexvi.supabase.co/functions/v1/turnstile-verify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: publishableKey,
        },
        body: JSON.stringify({ token }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      return res.status(403).json({
        success: false,
        message: 'CAPTCHA verification failed',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'CAPTCHA verified',
    });
  } catch (error) {
    console.error('Turnstile verification error:', error);

    return res.status(502).json({
      success: false,
      message: 'Verification service unavailable',
    });
  }
}
