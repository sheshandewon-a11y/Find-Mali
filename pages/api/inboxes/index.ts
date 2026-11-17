
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

  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY;

  const proxyToken =
    process.env.INBOX_PROXY_TOKEN;

  if (!publishableKey || !proxyToken) {
    return res.status(503).json({
      success: false,
      message: 'Inbox service is not configured',
    });
  }

  // Vercel overwrites this header with the visitor's public IP.
  const forwardedIp = req.headers['x-forwarded-for'];

  const clientIp = Array.isArray(forwardedIp)
    ? forwardedIp[0]?.trim()
    : typeof forwardedIp === 'string'
      ? forwardedIp.trim()
      : '';

  // Accept only a single valid IP address.
  const isIPv4 =
    /^(?:\d{1,3}\.){3}\d{1,3}$/.test(clientIp) &&
    clientIp.split('.').every(
      (part) => Number(part) >= 0 && Number(part) <= 255
    );

  const isIPv6 =
    /^[0-9a-f:]+$/i.test(clientIp) &&
    clientIp.includes(':');

  const safeIp =
    isIPv4 || isIPv6 ? clientIp : '';

  try {
    const upstream = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: publishableKey,
        'x-inbox-proxy-token': proxyToken,
        ...(safeIp
          ? { 'x-vercel-forwarded-for': safeIp }
          : {}),
      },
      body: JSON.stringify({}),
      cache: 'no-store',
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
