
import type { NextApiRequest, NextApiResponse } from 'next';

const FUNCTION_URL =
  'https://xzfefaepyjgnwhcvexvi.supabase.co/functions/v1/inbox-api/api/inboxes';

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

  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return res.status(503).json({
      success: false,
      message: 'Inbox service is not configured',
    });
  }

  // Forward the visitor IP to the Supabase Edge Function
  // so the server-side rate limit can be applied.
  const forwardedHeader = req.headers['x-forwarded-for'];

  const clientIp = Array.isArray(forwardedHeader)
    ? forwardedHeader[0]
    : typeof forwardedHeader === 'string'
      ? forwardedHeader.split(',')[0].trim()
      : '';

  try {
    const upstream = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: publishableKey,
        ...(clientIp ? { 'x-forwarded-for': clientIp } : {}),
      },
      body: JSON.stringify({}),
    });

    const data = await upstream.json().catch(() => ({}));

    return res.status(upstream.status).json(data);
  } catch (error) {
    console.error('Create inbox proxy error:', error);

    return res.status(502).json({
      success: false,
      message: 'Inbox service is temporarily unavailable',
    });
  }
}
