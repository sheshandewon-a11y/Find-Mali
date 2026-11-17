
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const required = [
  'pages/index.tsx',
  'pages/privacy.tsx',
  'pages/terms.tsx',
  'pages/404.tsx',
  'pages/api/health.ts',
  'pages/api/inboxes/index.ts',
  'pages/api/inboxes/[email]/messages.ts',
  'styles/global.css',
  'public/robots.txt',
  'public/sitemap.xml',
  'public/favicon.svg',
  'README.md',
];

const missing = required.filter(
  (file) => !existsSync(join(root, file))
);

if (missing.length > 0) {
  console.error('Missing required files:', missing.join(', '));
  process.exit(1);
}

const read = (file) =>
  readFileSync(join(root, file), 'utf8');

const page = read('pages/index.tsx');
const health = read('pages/api/health.ts');
const createInboxApi = read('pages/api/inboxes/index.ts');
const messagesApi = read(
  'pages/api/inboxes/[email]/messages.ts'
);

const pkg = JSON.parse(read('package.json'));

const timerRowMatch = page.match(
  /<div className="timer-row">([\s\S]*?)<\/div>/
);

const timerRow = timerRowMatch?.[1] ?? '';

const normalizedMessagesApi = messagesApi.replace(/\\/g, '');

const checks = [
  [
    'real findmali.com inbox domain is used',
    /@findmali\.com/i.test(normalizedMessagesApi) &&
      page.includes("fetch('/api/inboxes'") &&
      page.includes('/api/inboxes/'),
  ],
  [
    'production mode is reported by health endpoint',
    health.includes("mode: 'production'") &&
      health.includes('emailBackend,'),
  ],
  [
    'Supabase backend configuration is checked',
    health.includes('SUPABASE_PUBLISHABLE_KEY') &&
      health.includes('supabase-configured'),
  ],
  [
    'real inbox creation API is connected',
    page.includes("fetch('/api/inboxes'") &&
      createInboxApi.includes('SUPABASE_PUBLISHABLE_KEY'),
  ],
  [
    'private proxy token is required by the creation API',
    createInboxApi.includes('INBOX_PROXY_TOKEN') &&
      createInboxApi.includes('x-inbox-proxy-token'),
  ],
  [
    'Vercel client IP forwarding is present',
    createInboxApi.includes("req.headers['x-forwarded-for']") &&
      createInboxApi.includes('x-vercel-forwarded-for'),
  ],
  [
    'real inbox messages API is connected',
    page.includes('/api/inboxes/') &&
      messagesApi.includes('SUPABASE_PUBLISHABLE_KEY'),
  ],
  [
    'name-based inbox addresses are supported',
    /[a-z0-9-]\{3,32\}@findmali\\?\.com/i.test(
      messagesApi
    ) &&
      /[a-z0-9-]\{3,32\}@findmali\\?\.com/i.test(page),
  ],
  [
    'active inbox is saved for page restoration',
    page.includes('findmali_active_inbox') &&
      page.includes('localStorage.setItem'),
  ],
  [
    'previous inbox restoration is implemented',
    page.includes('restoreOrCreateInbox') &&
      page.includes('localStorage.getItem'),
  ],
  [
    'expired inbox automatically gets replaced',
    page.includes('Your inbox has expired') &&
      page.includes('await createRealInbox()'),
  ],
  [
    'automatic session countdown is present',
    page.includes('window.setInterval') &&
      page.includes('window.clearInterval'),
  ],
  [
    'session timer display is present',
    timerRow.includes('{time}'),
  ],
  [
    'session timer has no pause/resume/reset controls',
    timerRow.length > 0 &&
      !timerRow.includes('<button') &&
      !/\b(Pause|Resume|Reset)\b/.test(timerRow) &&
      !page.includes('timerRunning'),
  ],
  [
    'Turnstile is not required by the frontend',
    !page.includes('turnstile.execute') &&
      !page.includes('cf-turnstile'),
  ],
  [
    'local demo state persistence is not used',
    !page.includes('find-mali-demo-v2'),
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

for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);

  if (!passed) {
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `Project structure verified (${required.length} required files).`
);
