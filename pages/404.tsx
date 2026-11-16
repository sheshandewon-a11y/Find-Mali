import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function NotFound() {
  return <>
    <Head><title>Page not found | FIND MALI</title><meta name="robots" content="noindex" /></Head>
    <main className="legal-shell" style={{ minHeight: '75vh', display: 'grid', alignContent: 'center' }}>
      <div className="brand-mark" style={{ width: 58, height: 58 }}><Mail size={28} /></div>
      <span className="kicker" style={{ marginTop: 28 }}>404 · LOST IN SPACE</span>
      <h1>Page not found.</h1>
      <p>The page you are looking for may have moved or may not exist.</p>
      <Link href="/" className="button primary" style={{ width: 'fit-content', marginTop: 18 }}><ArrowLeft size={16} /> Back to home</Link>
    </main>
  </>;
}
