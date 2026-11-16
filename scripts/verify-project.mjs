
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const required = [
  'pages/index.tsx',
  'pages/privacy.tsx',
  'pages/terms.tsx',
  'pages/404.tsx',
  'pages/api/health.ts',
  'styles/global.css',
  'public/robots.txt',
  'public/sitemap.xml',
  'public/favicon.svg',
  'README.md',
];

const missing = required.filter((file) => !existsSync(join(root, file)));

if (missing.length) {
  console.error('Missing required files:', missing.join(', '));
  process.exit(1);
}

const page = readFileSync(join(root, 'pages/index.tsx'), 'utf8');
const health = readFileSync(join(root, 'pages/api/health.ts'), 'utf8');
const pkg = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8')
);

const checks = [
  [
    'fictional demo domain is used',
    page.includes('@demo.findmali.test'),
  ],
  [
    'no real mail backend is represented as active',
    health.includes("emailBackend: 'disabled'"),
  ],
  [
    'local demo state persistence is present',
    page.includes('find-mali-demo-v2'),
  ],
  [
    'automatic session countdown is present',
    page.includes('window.setInterval'),
  ],
  [
    'session timer reset control is present',
    page.includes('Session preview timer reset'),
  ],
  [
    'pause/resume controls are removed',
    !page.includes('timerRunning') &&
      !/\b(Pause|Resume)\b/.test(page),
  ],
  [
    'typecheck script exists',
    Boolean(pkg.scripts?.typecheck),
  ],
  [
    'production build script exists',
    Boolean(pkg.scripts?.build),
  ],
];

let failed = false;

for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);

  if (!ok) {
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `Project structure verified (${required.length} required files).`
);
