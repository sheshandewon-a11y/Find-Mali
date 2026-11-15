# FIND MALI — Release 2.2 Deployment & QA

## Release scope
Frontend-only demonstration. It stores fictional preview state in the visitor's browser. `/api/health` reports `emailBackend: disabled`. No real mailbox, inbound/outbound email, account system, or production data store is included.

## Important hosting configuration
This project uses the Next.js server runtime because it includes `pages/api/health.ts`. Do **not** enable `output: 'export'` or configure a static output directory: static export does not support this API route. Vercel should detect Next.js automatically.

## Local checks
Use Node.js 20 or newer:

```bash
npm install
npm run verify
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:3000`, then check `/api/health`. It should return `status: ok`, `mode: frontend-demo`, and `emailBackend: disabled`.

## Vercel deployment
1. Push the extracted project to a Git repository you control.
2. Import that repository into Vercel.
3. Select the Next.js framework preset; keep the default build command (`next build`).
4. Deploy a preview first and test the checklist below.
5. Connect `findmali.com` only after checking the current DNS records at the registrar. Do not delete existing MX, TXT, or other records without understanding their use.

## CI
GitHub Actions runs project verification, TypeScript type checking, and a production build for pushes and pull requests.

## Preview QA checklist
- [ ] Homepage and navigation on mobile and desktop
- [ ] Copy demo address and create/reset demo inbox
- [ ] Search, open, mark read, and delete sample messages
- [ ] Timer pause/resume/reset
- [ ] Privacy, Terms, and 404 pages
- [ ] `/api/health` reports frontend-demo and email backend disabled
- [ ] Keyboard navigation and reduced-motion preference

## Production boundary
Do not enable real email receipt or verification-code collection as part of this demo. Any future production feature needs a separate safety, privacy, abuse-prevention and legal review. Privacy and Terms pages are starter text and require review before public launch.
