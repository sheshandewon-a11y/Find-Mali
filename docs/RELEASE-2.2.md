# Release 2.2 notes

- Corrected hosting mode: removed static export because the project contains a Next.js API route (`/api/health`).
- Added baseline response security headers (content-type sniffing protection, frame denial, referrer policy, and restricted device permissions).
- Added GitHub Actions CI for dependency install, project verification, TypeScript checking, and production build.
- Updated deployment instructions to explicitly preserve the Next.js server runtime.

This is still a frontend demo. The health route is diagnostic only and does not indicate a real email backend.
