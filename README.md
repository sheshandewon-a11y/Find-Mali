
# FIND MALI

FIND MALI is a temporary email service that allows users to create temporary email addresses and receive incoming emails.

## Technology Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Lucide React
- Supabase
- Cloudflare Email Routing
- Cloudflare Turnstile
- Vercel

## Requirements

- Node.js 20 or newer
- npm

## Installation

Clone the repository:

```bash
git clone https://github.com/sheshandewon-a11y/Find-Mali.git
cd Find-Mali
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open:

http://localhost:3000

## Project Validation

Run project verification:

```bash
npm run verify
```

Run TypeScript checking:

```bash
npm run typecheck
```

Build production version:

```bash
npm run build
```

## Current Features

- Responsive temporary email interface
- Mobile navigation
- Real inbox creation through the backend
- Name-based temporary email addresses
- 60-minute inbox session
- Automatic expired inbox replacement
- Copy email address
- Incoming email retrieval
- Message search and preview
- Cloudflare Turnstile verification
- Privacy Policy
- Terms of Use
- Health API

## Email Infrastructure

The project uses:

- Cloudflare Email Routing
- Cloudflare Worker for inbound email processing
- Supabase Edge Functions
- Supabase database
- Vercel API routes

The production email infrastructure is configured separately from the frontend.

## Environment Variables

The application uses server-side environment variables.

Examples of required configuration names:

- `SUPABASE_PUBLISHABLE_KEY`
- `INBOX_PROXY_TOKEN`
- `TURNSTILE_SITE_KEY`

Never commit secret values, private tokens or passwords to GitHub.

## Deployment

The project is designed for deployment on Vercel.

Do not enable static export because the application uses server-side API routes.

Do not change Cloudflare DNS or MX records without reviewing the existing email infrastructure.

## Support

For questions or support:

support@findmali.com

## Security

- Keep private credentials server-side.
- Never expose secret keys in frontend code.
- Keep email infrastructure credentials private.
- Use appropriate access controls for administrative services.

## License

All rights reserved unless otherwise specified.
