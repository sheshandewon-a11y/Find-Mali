
# FIND MALI

A modern, responsive temporary inbox frontend built with Next.js.

## Technology

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Lucide React

## Requirements

- Node.js 20 or newer
- npm

## Installation

Clone or download the repository.

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

- Responsive landing page
- Mobile navigation
- Demo inbox address
- Copy address
- Session timer
- Create new demo inbox
- Search sample messages
- Message preview
- Delete sample messages
- Local browser persistence
- Privacy Policy
- Terms of Use
- Health API

## Important Notice

FIND MALI currently operates as a frontend demonstration.

It does not currently include:

- Real email receiving
- Real email sending
- Mail server
- Production database
- User authentication
- Deliverable email addresses

All inbox messages are fictional.

Demo addresses use the reserved domain:

@demo.findmali.test

Do not use this preview for private or important communications.

## Deployment

The project uses the Next.js server runtime.

Do not enable static export because the project includes:

/api/health

Vercel should automatically detect the Next.js framework.

Deploy a preview first and test it before connecting the custom domain.

Do not change DNS or MX records until the email architecture has been planned.

## Future Development

See:

docs/PRODUCTION-ROADMAP.md
