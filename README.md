# FIND MALI — Design-matched Frontend v2.0

A responsive Next.js frontend prototype based on the approved FIND MALI dark futuristic design concept.

## Technology
- Next.js 15 / React 19
- TypeScript
- Tailwind CSS 3 (project styling is authored in `styles/global.css`)
- Lucide React icons
- Static export configuration for deployment to static hosting

## Run locally
1. Install Node.js 20 or newer.
2. Extract this ZIP and open a terminal in the `find-mali` folder.
3. Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validate and build

```bash
npm run typecheck
npm run build
```

The Next.js static export is configured in `next.config.ts`. The generated static site is written to `out/` after a successful build.

## Included features
- Responsive landing page with neon cyan, violet and magenta visual identity
- CSS-built animated hero illustration
- Mobile navigation menu
- Inbox demo address with copy action
- Visual 60-minute session timer
- Create new demo inbox, refresh preview and clear sample messages
- Search, select, preview and delete fictional messages
- Read/unread state in the sample message list
- Feature cards, About section and expandable FAQ
- Privacy Policy and Terms starter pages
- Custom 404 page, SVG favicon, web manifest, robots.txt and sitemap.xml
- Reduced-motion support

## Important scope limitation
This is a **frontend-only demonstration**. It does not include a mail server, database, authentication, real inbound/outbound email, or deliverable email addresses. All messages are fictional. Demo addresses end in `@demo.findmali.test`, a reserved non-deliverable test domain. The timer is visual UI state only. Do not enter personal, confidential or sensitive information.

Privacy Policy and Terms are starter templates, not legal advice. They must be reviewed and replaced with accurate production policies before launch.

## Deployment notes
The project is configured for Next.js static export. You can connect the repository to a compatible static hosting workflow after running and checking the production build. For a Vercel deployment, import the project folder/repository and use the default Next.js build settings. Confirm the generated `out/` directory and preview the site before attaching `findmali.com`.

Do not change domain DNS or email routing until the current DNS records and intended architecture have been reviewed. No email routing is configured by this frontend project.

## Suggested pre-launch QA
- Run `npm run typecheck` and `npm run build`.
- Test at narrow mobile, tablet and desktop widths.
- Check keyboard navigation and reduced-motion mode.
- Verify all navigation anchors and legal-page links.
- Review Privacy and Terms with qualified advice.
- Keep the demo-only scope clear until a separate, reviewed backend exists.

## v2.1 additions
- Demo inbox state persists locally in the browser.
- Session preview timer supports pause, resume and reset.
- Reset Demo restores the original fictional sample messages.
- `/api/health` reports frontend-demo mode and disabled email backend.
- `npm run verify` checks required project files and key demo-safety behavior.
- See `DEPLOYMENT.md` for QA and Vercel deployment steps.
