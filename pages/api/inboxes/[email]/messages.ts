import type { NextApiRequest, NextApiResponse } from 'next';

const FUNCTION_BASE =
  'https://xzfefaepyjgnwhcvexvi.supabase.co/functions/v1/inbox-api';

export default async function handler(
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

  const email = req.query.email;

  if (
    typeof email !== 'string' ||
    !/^[a-f0-9]{12}@findmali\.com$/i.test(email)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid inbox address',
    });
  }

  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return res.status(503).json({
      success: false,
      message: 'Inbox service is not configured',
    });
  }

  try {
    const url =
      `${FUNCTION_BASE}/api/inboxes/${encodeURIComponent(
        email.toLowerCase()
      )}/messages`;

    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: publishableKey,
      },
    });

    const data = await upstream.json().catch(() => ({}));

    return res.status(upstream.status).json(data);
  } catch (error) {
    console.error('Fetch inbox messages proxy error:', error);

    return res.status(502).json({
      success: false,
      message: 'Inbox service is temporarily unavailable',
    });
  }
}
