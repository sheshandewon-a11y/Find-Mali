
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import {
  Activity, ArrowRight, Check, ChevronDown, Clock3,
  Copy, Globe2, Inbox, LockKeyhole, Mail, Menu,
  Plus, RefreshCw, ShieldCheck, Sparkles, Trash2,
  X, Zap, Heart, Eye, Send, ArrowLeft,
} from 'lucide-react';

type DemoEmail = {
  id: number;
  sender: string;
  subject: string;
  time: string;
  body: string;
  unread: boolean;
  tag: string;
};

const STORAGE_KEY = 'find-mali-demo-v2';

const seedEmails: DemoEmail[] = [
  {
    id: 1,
    sender: 'hello@sample.test',
    subject: 'Welcome to your sample inbox',
    time: 'Just now',
    body: 'Welcome to the FIND MALI interface preview. This is a fictional sample message. No external email was received.',
    unread: true,
    tag: 'Welcome',
  },
  {
    id: 2,
    sender: 'updates@example.test',
    subject: 'Your workspace is ready to explore',
    time: '4 min ago',
    body: 'Your sample workspace is ready. All content in this preview is fictional.',
    unread: false,
    tag: 'Updates',
  },
  {
    id: 3,
    sender: 'team@demo.test',
    subject: 'A few tips to get started',
    time: '12 min ago',
    body: 'Use the controls to explore the sample inbox. This is a local interface demonstration only.',
    unread: false,
    tag: 'Guide',
  },
];

function isValidEmail(value: any): value is DemoEmail {
  return (
    value &&
    typeof value.id === 'number' &&
    typeof value.sender === 'string' &&
    typeof value.subject === 'string' &&
    typeof value.body === 'string' &&
    typeof value.time === 'string' &&
    typeof value.unread === 'boolean' &&
    typeof value.tag === 'string'
  );
}

export default function Home() {
  const [address, setAddress] = useState(
    'hello-visitor@demo.findmali.test'
  );
  const [emails, setEmails] = useState<DemoEmail[]>(seedEmails);
  const [selected, setSelected] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(3600);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState(
    'Demo environment ready · sample messages only'
  );
  const [faqOpen, setFaqOpen] = useState(0);

  // TURNSTILE STATE
  const [siteKey, setSiteKey] = useState('');
  const [siteKeyLoading, setSiteKeyLoading] = useState(true);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [creatingInbox, setCreatingInbox] = useState(false);

  // LOAD TURNSTILE SITE KEY FROM SERVER
  useEffect(() => {
    let cancelled = false;

    async function loadTurnstileConfig() {
      try {
        const response = await fetch('/api/turnstile-config', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Turnstile configuration unavailable');
        }

        const data = await response.json();

        if (
          !cancelled &&
          typeof data.siteKey === 'string' &&
          data.siteKey.length > 0
        ) {
          setSiteKey(data.siteKey);
        } else if (!cancelled) {
          setNotice('Turnstile Site Key is not configured');
        }
      } catch {
        if (!cancelled) {
          setNotice('Unable to load CAPTCHA configuration');
        }
      } finally {
        if (!cancelled) {
          setSiteKeyLoading(false);
        }
      }
    }

    loadTurnstileConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  // LOAD SAVED DEMO DATA
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const saved = JSON.parse(raw);

        if (
          typeof saved.address === 'string' &&
          saved.address.endsWith('@demo.findmali.test')
        ) {
          setAddress(saved.address);
        }

        if (Array.isArray(saved.emails)) {
          setEmails(saved.emails.filter(isValidEmail));
        }

        if (
          typeof saved.expiresAt === 'number' &&
          Number.isFinite(saved.expiresAt)
        ) {
          setExpiresAt(saved.expiresAt);
        } else {
          const oldRemaining =
            typeof saved.remaining === 'number'
              ? Math.max(0, Math.min(3600, Math.floor(saved.remaining)))
              : 3600;

          setExpiresAt(Date.now() + oldRemaining * 1000);
        }
      } else {
        setExpiresAt(Date.now() + 3600 * 1000);
      }
    } catch {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Storage unavailable.
      }

      setExpiresAt(Date.now() + 3600 * 1000);
    } finally {
      setHydrated(true);
    }
  }, []);

  // SAVE DEMO DATA
  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          address,
          emails,
          remaining,
          expiresAt,
        })
      );
    } catch {
      setNotice('Browser storage is unavailable');
    }
  }, [hydrated, address, emails, remaining, expiresAt]);

  // AUTOMATIC SESSION TIMER
  useEffect(() => {
    if (!hydrated || expiresAt === null) return;

    const updateTimer = () => {
      const seconds = Math.max(
        0,
        Math.ceil((expiresAt - Date.now()) / 1000)
      );

      setRemaining(seconds);
    };

    updateTimer();

    const timer = window.setInterval(updateTimer, 1000);

    document.addEventListener('visibilitychange', updateTimer);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', updateTimer);
    };
  }, [hydrated, expiresAt]);

  // MOBILE MENU ESCAPE SUPPORT
  useEffect(() => {
    if (!mobileMenu) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenu(false);
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenu]);

  const filteredEmails = emails.filter((email) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    return (
      email.sender.toLowerCase().includes(query) ||
      email.subject.toLowerCase().includes(query) ||
      email.body.toLowerCase().includes(query)
    );
  });

  const activeEmail = emails.find(
    (email) => email.id === selected
  );

  const time = `${Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0')}:${(remaining % 60)
    .toString()
    .padStart(2, '0')}`;

  // COPY ADDRESS
  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setNotice('Demo address copied to clipboard');

      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setNotice('Clipboard is not available in this browser');
    }
  }

  // CREATE DEMO INBOX AFTER CAPTCHA CALLBACK
  function createDemoInbox() {
    const newAddress =
      'visitor-' +
      Math.random().toString(36).slice(2, 7) +
      '@demo.findmali.test';

    const newExpiry = Date.now() + 3600 * 1000;

    setAddress(newAddress);
    setEmails([]);
    setSelected(null);
    setRemaining(3600);
    setExpiresAt(newExpiry);
    setSearchQuery('');

    setShowTurnstile(false);
    setTurnstileToken('');
    setCreatingInbox(false);

    setNotice('Fresh sample inbox created');
  }

  // NEW INBOX BUTTON
  function newInbox() {
    if (siteKeyLoading) {
      setNotice('Loading CAPTCHA configuration. Please wait.');
      return;
    }

    if (!siteKey) {
      setNotice('CAPTCHA is unavailable. Please check configuration.');
      return;
    }

    setTurnstileToken('');
    setShowTurnstile(true);
    setNotice('Please complete the security check to continue.');
  }

  // TURNSTILE SUCCESS
  function handleTurnstileSuccess(token: string) {
    if (!token) {
      setNotice('CAPTCHA verification did not return a token');
      return;
    }

    setTurnstileToken(token);
    setCreatingInbox(true);

    // Frontend demo only.
    // Server-side token verification must be added before
    // connecting this action to real inbox creation.
    createDemoInbox();
  }

  // TURNSTILE ERROR
  function handleTurnstileError() {
    setTurnstileToken('');
    setCreatingInbox(false);
    setNotice('CAPTCHA error. Please try again.');
  }

  // CANCEL CAPTCHA
  function cancelTurnstile() {
    setShowTurnstile(false);
    setTurnstileToken('');
    setCreatingInbox(false);
    setNotice('Security check cancelled');
  }

  // RESET DEMO PREVIEW
  function resetPreview() {
    const newExpiry = Date.now() + 3600 * 1000;

    setAddress('hello-visitor@demo.findmali.test');
    setEmails(seedEmails);
    setSelected(null);
    setRemaining(3600);
    setExpiresAt(newExpiry);
    setSearchQuery('');
    setShowTurnstile(false);
    setTurnstileToken('');

    setNotice('Preview restored to its original sample state');
  }

  // REFRESH LOCAL DEMO DATA
  function refresh() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        setNotice('No saved demo inbox was found');
        return;
      }

      const saved = JSON.parse(raw);

      if (
        typeof saved.address === 'string' &&
        saved.address.endsWith('@demo.findmali.test')
      ) {
        setAddress(saved.address);
      }

      if (Array.isArray(saved.emails)) {
        setEmails(saved.emails.filter(isValidEmail));
      }

      if (
        typeof saved.expiresAt === 'number' &&
        Number.isFinite(saved.expiresAt)
      ) {
        setExpiresAt(saved.expiresAt);
      }

      setSelected(null);
      setSearchQuery('');
      setNotice('Local demo inbox refreshed successfully');
    } catch {
      setNotice('Unable to refresh local demo data');
    }
  }

  function openMessage(id: number) {
    setSelected(id);

    setEmails((value) =>
      value.map((message) =>
        message.id === id
          ? { ...message, unread: false }
          : message
      )
    );
  }

  function closeMessage() {
    setSelected(null);
  }

  function removeMessage(id: number) {
    setEmails((value) =>
      value.filter((email) => email.id !== id)
    );

    setSelected(null);
    setNotice('Sample message removed');
  }

  function clearAllMessages() {
    setEmails([]);
    setSelected(null);
    setSearchQuery('');
    setNotice('All sample messages cleared');
  }

  const faqs = [
    [
      'Does FIND MALI receive real emails?',
      'This website version is a frontend preview. It only displays fictional sample messages and does not connect to an external mail server.',
    ],
    [
      'Do I need to create an account?',
      'No account is needed to explore this preview. The address shown is a non-deliverable demo placeholder.',
    ],
    [
      'How long is a session?',
      'The interface demonstrates a 60-minute session timer. It is a visual feature and does not manage a real mailbox.',
    ],
    [
      'Can I use it on my phone?',
      'Yes. The layout is responsive and adapts to mobile, tablet and desktop screens.',
    ],
  ];

  return (
    <>
      <Head>
        <title>FIND MALI — Your Inbox, Simplified</title>
        <meta
          name="description"
          content="Explore the FIND MALI private inbox interface preview."
        />
        <meta name="theme-color" content="#050b1b" />
        <meta
          property="og:title"
          content="FIND MALI — Your Inbox, Simplified"
        />
        <meta
          property="og:description"
          content="Explore the FIND MALI inbox interface preview."
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </Head>

      <div className="site-shell">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>

        {/* HEADER */}
        <header className="topbar">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <Mail size={24} />
            </span>
            <span>
              FIND <b>MALI</b>
              <small>YOUR INBOX, SIMPLIFIED</small>
            </span>
          </Link>

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenu((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenu}
            aria-controls="main-navigation"
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>

          <nav
            id="main-navigation"
            className={mobileMenu ? 'nav open' : 'nav'}
            onClick={() => setMobileMenu(false)}
          >
            <a className="active" href="#home">Home</a>
            <a href="#inbox">Inbox</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
            <a href="#about">About</a>
            <a className="nav-cta" href="#inbox">
              Get Started <ArrowRight size={15} />
            </a>
          </nav>
        </header>

        <main id="main-content" tabIndex={-1}>
          {/* HERO */}
          <section className="hero" id="home">
            <div className="hero-copy">
              <div className="free-pill">
                <Sparkles size={14} />
                100% FREE PREVIEW · NO REGISTRATION
              </div>

              <h1>FIND <span>MALI</span></h1>
              <h2>Your Temporary Inbox</h2>
              <h3>Quick. Secure. <em>Simple.</em></h3>

              <p>
                Explore a fresh, modern inbox experience with
                a clean interface that keeps everything in one
                place.
              </p>

              <div className="hero-actions">
                <a className="button primary" href="#inbox">
                  <Zap size={17} /> Explore Inbox
                </a>
                <a className="button outline" href="#features">
                  <Eye size={16} /> Learn More
                </a>
              </div>

              <div className="hero-stats">
                <div><Zap /><b>Instant</b><small>Demo setup</small></div>
                <div><ShieldCheck /><b>Privacy</b><small>Focused design</small></div>
                <div><Clock3 /><b>60 Min</b><small>Session preview</small></div>
                <div><Heart /><b>Free</b><small>To explore</small></div>
              </div>
            </div>

            <div className="hero-art">
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />
              <div className="art-grid" />

              <div className="mail-platform">
                <div className="platform-top" />
                <div className="neon-envelope">
                  <div className="env-flap" />
                  <Mail size={104} strokeWidth={1.15} />
                </div>
                <div className="platform-glow" />
              </div>

              <div className="floating-lock">
                <LockKeyhole size={38} />
              </div>

              <div className="float-chip chip-a">
                <ShieldCheck size={15} /> PRIVATE BY DESIGN
              </div>
              <div className="float-chip chip-b">
                <Activity size={15} /> LIVE PREVIEW
              </div>
              <div className="spark s1">✦</div>
              <div className="spark s2">✧</div>
            </div>
          </section>

          {/* INBOX */}
          <section className="inbox-section" id="inbox">
            <div className="section-heading">
              <div>
                <span className="kicker">YOUR PERSONAL SPACE</span>
                <h2>Your inbox is ready <span className="live-dot" /></h2>
                <p>One simple place to explore your sample messages.</p>
              </div>
              <span className="preview-badge"><i /> PREVIEW ACTIVE</span>
            </div>

            <div className="inbox-dashboard panel">
              <div className="inbox-top">
                <div className="mascot-wrap">
                  <div className="mascot-aura" />
                  <div className="mascot">
                    <div className="antenna" />
                    <div className="robot-head"><i /><i /></div>
                    <div className="robot-body"><Mail size={34} /></div>
                  </div>
                </div>

                <div className="address-area">
                  <div className="ready-label">
                    <span className="check-round"><Check size={15} /></span>
                    YOUR TEMPORARY INBOX IS READY
                  </div>

                  <h3>Welcome to your inbox</h3>
                  <p>Your demo address is ready to copy and explore.</p>

                  <div className="address-row">
                    <div className="address-value">
                      <Mail size={18} />
                      <strong>{address}</strong>
                    </div>
                    <button className="copy-button" onClick={copyAddress}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="timer-row">
                    <Clock3 size={16} />
                    <span>Session preview</span>
                    <b>{time}</b>
                  </div>

                  <div className="progress-track">
                    <span style={{ width: (remaining / 3600) * 100 + '%' }} />
                  </div>
                </div>

                <div className="inbox-actions">
                  <h4>Inbox Actions</h4>

                  <button onClick={refresh}>
                    <RefreshCw size={16} /> Refresh
                  </button>

                  <button onClick={newInbox} disabled={siteKeyLoading || creatingInbox}>
                    <Plus size={17} />
                    {siteKeyLoading ? 'Loading...' : 'New Inbox'}
                  </button>

                  <button className="delete-all" onClick={clearAllMessages}>
                    <Trash2 size={16} /> Clear All
                  </button>

                  <button onClick={resetPreview}>
                    <RefreshCw size={16} /> Reset Demo
                  </button>

                  {/* CLOUDFLARE TURNSTILE */}
                  {showTurnstile && (
                    <div
                      className="turnstile-panel"
                      style={{
                        marginTop: '14px',
                        padding: '14px',
                        border: '1px solid rgba(0, 220, 255, 0.25)',
                        borderRadius: '14px',
                        background: 'rgba(0, 220, 255, 0.05)',
                      }}
                    >
                      <p style={{ marginBottom: '10px', fontSize: '13px' }}>
                        Complete the security check
                      </p>

                      {siteKey ? (
                        <Turnstile
                          siteKey={siteKey}
                          onSuccess={handleTurnstileSuccess}
                          onExpire={() => {
                            setTurnstileToken('');
                            setCreatingInbox(false);
                            setNotice('CAPTCHA expired. Please try again.');
                          }}
                          onError={handleTurnstileError}
                          options={{
                            theme: 'dark',
                            size: 'normal',
                          }}
                        />
                      ) : (
                        <p role="alert">
                          CAPTCHA configuration is unavailable.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={cancelTurnstile}
                        style={{ marginTop: '10px' }}
                      >
                        <X size={15} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="recent-head">
                <h3>
                  {activeEmail ? (
                    <>Message Details <span className="detail-count">OPEN</span></>
                  ) : (
                    <>
                      Recent Messages
                      <span>{emails.length}</span>
                      <small className="unread-count">
                        {emails.filter((email) => email.unread).length} unread
                      </small>
                    </>
                  )}
                </h3>

                {!activeEmail && (
                  <span className="recent-hint">Tap a message to read</span>
                )}
              </div>

              {!activeEmail && (
                <div className="inbox-search">
                  <Mail size={17} />
                  <input
                    type="search"
                    placeholder="Search messages, senders..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    aria-label="Search sample messages"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}

              {activeEmail ? (
                <div className="full-message-view">
                  <button className="back-messages-button" onClick={closeMessage}>
                    <ArrowLeft size={17} /> Back to Recent Messages
                  </button>

                  <article className="full-message-card">
                    <div className="reader-top">
                      <span className="kicker">MESSAGE DETAILS</span>
                      <button
                        className="icon-button danger"
                        onClick={() => removeMessage(activeEmail.id)}
                        aria-label="Delete message"
                        title="Delete message"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <h3>{activeEmail.subject}</h3>

                    <div className="sender-line">
                      <span className="message-avatar">
                        {activeEmail.sender[0].toUpperCase()}
                      </span>
                      <span>
                        <strong>{activeEmail.sender}</strong>
                        <small>To: {address}</small>
                      </span>
                      <time>{activeEmail.time}</time>
                    </div>

                    <div className="email-body">{activeEmail.body}</div>

                    <div className="sample-label">
                      <ShieldCheck size={15} /> Fictional sample content
                    </div>
                  </article>
                </div>
              ) : (
                <div className="recent-list">
                  {filteredEmails.slice(0, 3).map((email, index) => (
                    <button
                      className="recent-item"
                      key={email.id}
                      onClick={() => openMessage(email.id)}
                    >
                      <span className={'mail-app-icon app-' + index}>
                        <Mail size={20} />
                      </span>
                      <span className="recent-text">
                        <b>{email.sender}</b>
                        <small>{email.subject}</small>
                      </span>
                      <time>{email.time}</time>
                      <span className="view-pill">View</span>
                    </button>
                  ))}

                  {filteredEmails.length === 0 && (
                    <div className="recent-empty">
                      <Inbox size={22} />
                      {emails.length === 0
                        ? 'Your sample inbox is empty. Create a new demo inbox to start again.'
                        : 'No matching sample messages found.'}
                    </div>
                  )}
                </div>
              )}

              <p className="notice" role="status">{notice}</p>
            </div>
          </section>

          {/* FEATURES */}
          <section className="features" id="features">
            <div className="section-heading centered">
              <div>
                <span className="kicker">MADE FOR A BETTER EXPERIENCE</span>
                <h2>Everything feels simpler.</h2>
                <p>A clean interface, thoughtful details and controls that stay out of your way.</p>
              </div>
            </div>

            <div className="feature-grid">
              <article className="feature-card panel">
                <span className="feature-icon cyan"><Zap /></span>
                <h3>Quick to explore</h3>
                <p>A simple flow helps you get around the preview without unnecessary steps.</p>
              </article>
              <article className="feature-card panel">
                <span className="feature-icon pink"><ShieldCheck /></span>
                <h3>Privacy-minded</h3>
                <p>Clear preview labels and fictional data keep the purpose of this demo transparent.</p>
              </article>
              <article className="feature-card panel">
                <span className="feature-icon violet"><Activity /></span>
                <h3>Smart controls</h3>
                <p>Refresh, copy and manage sample messages in one focused space.</p>
              </article>
              <article className="feature-card panel">
                <span className="feature-icon blue"><Globe2 /></span>
                <h3>Works on any screen</h3>
                <p>A responsive layout designed for phones, tablets and desktop screens.</p>
              </article>
            </div>
          </section>

          {/* ABOUT */}
          <section className="about panel" id="about">
            <div className="about-art">
              <div className="about-shield">
                <ShieldCheck size={74} />
                <span />
              </div>
              <div className="about-orbit" />
            </div>

            <div>
              <span className="kicker">ABOUT FIND MALI</span>
              <h2>A simpler way to explore your inbox.</h2>
              <p>
                FIND MALI is being shaped around a clear, approachable inbox
                experience. This current build is a frontend concept, with
                sample-only content so you can explore the design and interactions.
              </p>
              <ul>
                <li><Check /> Clean and simple interface</li>
                <li><Check /> Mobile-friendly experience</li>
                <li><Check /> Transparent preview status</li>
              </ul>
            </div>
          </section>

          {/* FAQ */}
          <section className="faq" id="faq">
            <div className="section-heading centered">
              <div>
                <span className="kicker">HELP CENTER</span>
                <h2>Frequently asked questions</h2>
                <p>Quick answers about this website preview.</p>
              </div>
            </div>

            <div className="faq-list">
              {faqs.map(([question, answer], index) => (
                <div
                  className={faqOpen === index ? 'faq-item opened' : 'faq-item'}
                  key={question}
                >
                  <button
                    onClick={() => setFaqOpen(faqOpen === index ? -1 : index)}
                    aria-expanded={faqOpen === index}
                  >
                    <span>{question}</span>
                    <ChevronDown size={18} />
                  </button>

                  {faqOpen === index && <p>{answer}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* CALL TO ACTION */}
          <section className="closing-cta">
            <div className="cta-icon"><Send size={27} /></div>
            <div>
              <span className="kicker">READY TO TAKE A LOOK?</span>
              <h2>Your next inbox starts here.</h2>
              <p>Explore the FIND MALI preview and see how it feels.</p>
            </div>
            <a className="button primary" href="#inbox">
              Get Started <ArrowRight size={16} />
            </a>
          </section>
        </main>

        {/* FOOTER */}
        <footer>
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark"><Mail size={21} /></span>
            <span>
              FIND <b>MALI</b>
              <small>YOUR INBOX, SIMPLIFIED</small>
            </span>
          </Link>

          <span>© 2026 FIND MALI. Frontend preview.</span>

          <div className="footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="#faq">Help</a>
          </div>
        </footer>
      </div>
    </>
  );
}
