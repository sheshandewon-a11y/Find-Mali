
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

type InboxMessage = {
  id: number;
  sender: string;
  subject: string;
  time: string;
  body: string;
  unread: boolean;
  tag: string;
};

export default function Home() {
  const [address, setAddress] = useState('');
  const [emails, setEmails] = useState<InboxMessage[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [notice, setNotice] = useState(
    'Create a new inbox to get started.'
  );

  const [faqOpen, setFaqOpen] = useState(0);

  // TURNSTILE STATE
  const [siteKey, setSiteKey] = useState('');
  const [siteKeyLoading, setSiteKeyLoading] = useState(true);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [, setTurnstileToken] = useState('');
  const [creatingInbox, setCreatingInbox] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  // RESPONSIVE CAPTCHA POSITION
  useEffect(() => {
    const media = window.matchMedia('(max-width: 680px)');

    const updateLayout = () => {
      setIsMobileLayout(media.matches);
    };

    updateLayout();
    media.addEventListener('change', updateLayout);

    return () => {
      media.removeEventListener('change', updateLayout);
    };
  }, []);

  // LOAD TURNSTILE SITE KEY
  useEffect(() => {
    let cancelled = false;

    async function loadTurnstileConfig() {
      try {
        const response = await fetch('/api/turnstile-config', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
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

  // CLIENT READY
  useEffect(() => {
    setHydrated(true);
  }, []);

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
      if (event.key === 'Escape') {
        setMobileMenu(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenu]);

  // FILTER EMAILS
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
    if (!address) {
      setNotice('Create an inbox first.');
      return;
    }

    try {
      await navigator.clipboard.writeText(address);

      setCopied(true);
      setNotice('Inbox address copied to clipboard');

      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setNotice('Clipboard is not available in this browser');
    }
  }

  // CREATE A REAL INBOX THROUGH THE SERVER API
  async function createRealInbox(token: string) {
    try {
      const response = await fetch('/api/inboxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json().catch(() => ({}));

      if (
        !response.ok ||
        result.success !== true ||
        !result.inbox
      ) {
        throw new Error(
          result.message || 'Unable to create inbox'
        );
      }

      const inbox = result.inbox;
      const expiry = new Date(inbox.expires_at).getTime();

      if (
        !inbox.email_address ||
        !Number.isFinite(expiry)
      ) {
        throw new Error(
          'The inbox service returned incomplete data'
        );
      }

      setAddress(inbox.email_address);
      setEmails([]);
      setSelected(null);
      setSearchQuery('');

      setExpiresAt(expiry);

      setRemaining(
        Math.max(
          0,
          Math.ceil((expiry - Date.now()) / 1000)
        )
      );

      setShowTurnstile(false);
      setTurnstileToken('');
      setCreatingInbox(false);

      setNotice('Your new temporary inbox is ready.');
    } catch (error) {
      setTurnstileToken('');
      setCreatingInbox(false);
      setShowTurnstile(false);

      setNotice(
        error instanceof Error
          ? error.message
          : 'Unable to create inbox. Please try again.'
      );
    }
  }

  // NEW MAIL BUTTON
  function newInbox() {
    if (siteKeyLoading) {
      setNotice(
        'Loading CAPTCHA configuration. Please wait.'
      );
      return;
    }

    if (!siteKey) {
      setNotice(
        'CAPTCHA is unavailable. Please check configuration.'
      );
      return;
    }

    setTurnstileToken('');
    setShowTurnstile(true);

    setNotice(
      'Please complete the security check to continue.'
    );
  }

  // TURNSTILE SUCCESS
  async function handleTurnstileSuccess(token: string) {
    if (!token) {
      setNotice(
        'CAPTCHA verification did not return a token'
      );
      return;
    }

    setTurnstileToken(token);
    setCreatingInbox(true);

    setNotice(
      'Verifying security check and creating inbox...'
    );

    await createRealInbox(token);
  }

  // TURNSTILE ERROR
  function handleTurnstileError() {
    setTurnstileToken('');
    setCreatingInbox(false);

    setNotice('CAPTCHA error. Please try again.');
  }

  // SHARED CAPTCHA OVERLAY
  function renderTurnstileOverlay() {
    if (!showTurnstile) return null;

    return (
      <div
        className="turnstile-overlay"
        role="dialog"
        aria-label="Security check"
        aria-modal="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px',
          borderRadius: 'inherit',
          background: 'rgba(4, 10, 27, 0.66)',
          backdropFilter: 'blur(9px)',
          WebkitBackdropFilter: 'blur(9px)',
        }}
      >
        <div
          className="turnstile-dialog"
          style={{
            width: 'min(100%, 390px)',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 14px',
            border: '1px solid rgba(0, 220, 255, 0.3)',
            borderRadius: '16px',
            background: 'rgba(7, 17, 39, 0.97)',
            boxShadow: '0 16px 50px rgba(0, 0, 0, 0.4)',
            textAlign: 'center',
          }}
        >
          <div>
            <strong
              style={{
                display: 'block',
                color: '#f4fbff',
                fontSize: '15px',
              }}
            >
              Security check
            </strong>

            <p
              style={{
                margin: '5px 0 0',
                color: '#a8bfd3',
                fontSize: '12px',
              }}
            >
              Complete the check to create your new inbox.
            </p>
          </div>

          {siteKey ? (
            <Turnstile
              siteKey={siteKey}
              onSuccess={handleTurnstileSuccess}
              onExpire={() => {
                setTurnstileToken('');
                setCreatingInbox(false);

                setNotice(
                  'CAPTCHA expired. Please try again.'
                );
              }}
              onError={handleTurnstileError}
              options={{
                theme: 'dark',
                size: 'normal',
              }}
            />
          ) : (
            <p
              role="alert"
              style={{
                color: '#ff9aa9',
                fontSize: '13px',
              }}
            >
              CAPTCHA configuration is unavailable.
            </p>
          )}

          {creatingInbox && (
            <span
              style={{
                color: '#9fefff',
                fontSize: '12px',
              }}
            >
              Creating your inbox...
            </span>
          )}
        </div>
      </div>
    );
  }

  // CLOSE THE CURRENT INBOX VIEW
  // This does not delete the database record.
  function resetPreview() {
    setAddress('');
    setEmails([]);
    setSelected(null);
    setRemaining(0);
    setExpiresAt(null);
    setSearchQuery('');

    setShowTurnstile(false);
    setTurnstileToken('');

    setNotice(
      'Inbox view closed. Create a new inbox to continue.'
    );
  }

  // REFRESH REAL INBOX MESSAGES
  async function refresh() {
    if (!address) {
      setNotice('Create an inbox first.');
      return;
    }

    try {
      const response = await fetch(
        `/api/inboxes/${encodeURIComponent(address)}/messages`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || 'Unable to refresh inbox'
        );
      }

      const receivedEmails: InboxMessage[] = (
        result.messages || []
      ).map((message: any) => ({
        id: Number(message.id),
        sender: message.sender || 'Unknown sender',
        subject: message.subject || '(No subject)',
        body: message.body || '',
        time: message.received_at
          ? new Date(message.received_at).toLocaleString()
          : '',
        unread: true,
        tag: 'Email',
      }));

      setEmails(receivedEmails);

      const expiry = new Date(
        result.expires_at
      ).getTime();

      if (Number.isFinite(expiry)) {
        setExpiresAt(expiry);
      }

      setSelected(null);
      setSearchQuery('');

      setNotice(
        `Inbox refreshed successfully · ${receivedEmails.length} messages`
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Unable to refresh inbox'
      );
    }
  }

  // OPEN MESSAGE
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

  // HIDE MESSAGE FROM CURRENT VIEW ONLY
  function removeMessage(id: number) {
    setEmails((value) =>
      value.filter((email) => email.id !== id)
    );

    setSelected(null);

    setNotice(
      'Message hidden from this view. Refresh to load it again.'
    );
  }

  // CLEAR CURRENT VIEW ONLY
  function clearAllMessages() {
    setEmails([]);
    setSelected(null);
    setSearchQuery('');

    setNotice(
      'Messages cleared from this view. Refresh to load them again.'
    );
  }

  // FAQ
  const faqs = [
    [
      'Does FIND MALI receive real emails?',
      'New inboxes use the findmali.com domain. Incoming delivery depends on the email routing service being active and correctly configured.',
    ],
    [
      'Do I need to create an account?',
      'No account is needed. Complete the security check to create a temporary inbox.',
    ],
    [
      'How long is an inbox active?',
      'Each temporary inbox currently expires after 10 minutes.',
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
          content="Create a temporary FIND MALI email inbox and receive messages."
        />

        <meta
          name="theme-color"
          content="#050b1b"
        />

        <meta
          property="og:title"
          content="FIND MALI — Your Inbox, Simplified"
        />

        <meta
          property="og:description"
          content="Create a temporary FIND MALI email inbox and receive messages."
        />

        <meta
          property="og:type"
          content="website"
        />

        <link
          rel="icon"
          href="/favicon.svg"
          type="image/svg+xml"
        />

        <link
          rel="manifest"
          href="/manifest.webmanifest"
        />
      </Head>

      <div className="site-shell">
        <a
          className="skip-link"
          href="#main-content"
        >
          Skip to main content
        </a>

        {/* HEADER */}
        <header className="topbar">
          <Link
            className="brand"
            href="/"
          >
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
                FREE TEMPORARY EMAIL · NO REGISTRATION
              </div>

              <h1>FIND <span>MALI</span></h1>
              <h2>Your Temporary Inbox</h2>
              <h3>Quick. Secure. <em>Simple.</em></h3>

              <p>
                Create a temporary email inbox and receive messages in one
                simple, easy-to-use place.
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
                <div>
                  <Zap />
                  <b>Instant</b>
                  <small>Inbox creation</small>
                </div>

                <div>
                  <ShieldCheck />
                  <b>Privacy</b>
                  <small>Focused experience</small>
                </div>

                <div>
                  <Clock3 />
                  <b>10 Min</b>
                  <small>Inbox lifetime</small>
                </div>

                <div>
                  <Heart />
                  <b>Free</b>
                  <small>To explore</small>
                </div>
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
                <Activity size={15} /> LIVE INBOX
              </div>

              <div className="spark s1">✦</div>
              <div className="spark s2">✧</div>
            </div>
          </section>

          {/* INBOX */}
          <section className="inbox-section" id="inbox">
            <div className="section-heading">
              <div>
                <span className="kicker">
                  YOUR PERSONAL SPACE
                </span>

                <h2>
                  Your inbox is active <span className="live-dot" />
                </h2>

                <p>
                  One simple place to receive and read your emails.
                </p>
              </div>

              <span className="preview-badge">
                <i /> INBOX STATUS
              </span>
            </div>

            <div className="inbox-dashboard panel">
              <div className="inbox-top">
                <div className="mascot-wrap">
                  <div className="mascot-aura" />

                  <div className="mascot">
                    <div className="antenna" />
                    <div className="robot-head">
                      <i />
                      <i />
                    </div>
                    <div className="robot-body">
                      <Mail size={34} />
                    </div>
                  </div>
                </div>

                <div className="address-area">
                  <div className="ready-label">
                    <span className="check-round">
                      <Check size={15} />
                    </span>

                    YOUR TEMPORARY INBOX
                  </div>

                  <h3>Welcome to your inbox</h3>

                  <p>
                    Your temporary email address is ready to copy and use.
                  </p>

                  <div className="address-row">
                    <div className="address-value">
                      <Mail size={18} />
                      <strong>
                        {address || 'Create a new inbox'}
                      </strong>
                    </div>

                    <button
                      className="copy-button"
                      onClick={copyAddress}
                      disabled={!address}
                    >
                      {copied ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}

                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="timer-row">
                    <Clock3 size={16} />
                    <span>Time remaining</span>
                    <b>{time}</b>
                  </div>

                  <div className="progress-track">
                    <span
                      style={{
                        width: `${Math.min(100, (remaining / 600) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* MAIL ACTIONS */}
                <div
                  className="inbox-actions"
                  style={{ position: 'relative' }}
                >
                  <h4>Mail Actions</h4>

                  <button onClick={refresh}>
                    <RefreshCw size={16} /> Refresh
                  </button>

                  <button
                    onClick={newInbox}
                    disabled={siteKeyLoading || creatingInbox}
                  >
                    <Plus size={17} />
                    {siteKeyLoading ? 'Loading...' : 'New Mail'}
                  </button>

                  <button
                    className="delete-all"
                    onClick={clearAllMessages}
                  >
                    <Trash2 size={16} /> Clear View
                  </button>

                  <button onClick={resetPreview}>
                    <RefreshCw size={16} /> Close Inbox
                  </button>

                  {/* MOBILE CAPTCHA OVERLAY */}
                  {isMobileLayout && renderTurnstileOverlay()}
                </div>
              </div>

              {/* RECENT MESSAGES AREA */}
              <div
                className="recent-area"
                style={{ position: 'relative' }}
              >
                {/* DESKTOP CAPTCHA OVERLAY */}
                {!isMobileLayout && renderTurnstileOverlay()}

                <div className="recent-head">
                  <h3>
                    {activeEmail ? (
                      <>
                        Message Details
                        <span className="detail-count">OPEN</span>
                      </>
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
                    <span className="recent-hint">
                      Tap a message to read
                    </span>
                  )}
                </div>

                {!activeEmail && (
                  <div className="inbox-search">
                    <Mail size={17} />

                    <input
                      type="search"
                      placeholder="Search messages, senders..."
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(event.target.value)
                      }
                      aria-label="Search messages"
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
                    <button
                      className="back-messages-button"
                      onClick={closeMessage}
                    >
                      <ArrowLeft size={17} />
                      Back to Recent Messages
                    </button>

                    <article className="full-message-card">
                      <div className="reader-top">
                        <span className="kicker">
                          MESSAGE DETAILS
                        </span>

                        <button
                          className="icon-button danger"
                          onClick={() =>
                            removeMessage(activeEmail.id)
                          }
                          aria-label="Hide message"
                          title="Hide message"
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

                      <div className="email-body">
                        {activeEmail.body}
                      </div>

                      <div className="sample-label">
                        <ShieldCheck size={15} />
                        Received email · Stored in your inbox
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
                          ? 'No messages yet. Send an email to this address, then tap Refresh.'
                          : 'No matching messages found.'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="notice" role="status">
                {notice}
              </p>
            </div>
          </section>

          {/* FEATURES */}
          <section className="features" id="features">
            <div className="section-heading centered">
              <div>
                <span className="kicker">
                  MADE FOR A BETTER EXPERIENCE
                </span>

                <h2>Everything feels simpler.</h2>

                <p>
                  A clean interface, thoughtful details and controls
                  that stay out of your way.
                </p>
              </div>
            </div>

            <div className="feature-grid">
              <article className="feature-card panel">
                <span className="feature-icon cyan">
                  <Zap />
                </span>

                <h3>Quick to explore</h3>

                <p>
                  Create an inbox quickly and manage messages in one place.
                </p>
              </article>

              <article className="feature-card panel">
                <span className="feature-icon pink">
                  <ShieldCheck />
                </span>

                <h3>Privacy-minded</h3>

                <p>
                  Temporary inboxes are designed for short-lived message access.
                </p>
              </article>

              <article className="feature-card panel">
                <span className="feature-icon violet">
                  <Activity />
                </span>

                <h3>Smart controls</h3>

                <p>
                  Refresh, copy and read messages in one focused space.
                </p>
              </article>

              <article className="feature-card panel">
                <span className="feature-icon blue">
                  <Globe2 />
                </span>

                <h3>Works on any screen</h3>

                <p>
                  A responsive layout designed for phones,
                  tablets and desktop screens.
                </p>
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
                FIND MALI provides temporary email inboxes without
                requiring an account. Create an address, receive
                incoming messages and read them from this page.
              </p>

              <ul>
                <li><Check /> Clean and simple interface</li>
                <li><Check /> Mobile-friendly experience</li>
                <li><Check /> Temporary email inboxes</li>
              </ul>
            </div>
          </section>

          {/* FAQ */}
          <section className="faq" id="faq">
            <div className="section-heading centered">
              <div>
                <span className="kicker">HELP CENTER</span>
                <h2>Frequently asked questions</h2>
                <p>Quick answers about temporary email.</p>
              </div>
            </div>

            <div className="faq-list">
              {faqs.map(([question, answer], index) => (
                <div
                  className={
                    faqOpen === index
                      ? 'faq-item opened'
                      : 'faq-item'
                  }
                  key={question}
                >
                  <button
                    onClick={() =>
                      setFaqOpen(
                        faqOpen === index ? -1 : index
                      )
                    }
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
            <div className="cta-icon">
              <Send size={27} />
            </div>

            <div>
              <span className="kicker">READY TO TAKE A LOOK?</span>
              <h2>Your next inbox starts here.</h2>
              <p>
                Create a temporary inbox and receive your emails.
              </p>
            </div>

            <a className="button primary" href="#inbox">
              Get Started <ArrowRight size={16} />
            </a>
          </section>
        </main>

        {/* FOOTER */}
        <footer>
          <Link
            className="brand footer-brand"
            href="/"
          >
            <span className="brand-mark">
              <Mail size={21} />
            </span>

            <span>
              FIND <b>MALI</b>
              <small>YOUR INBOX, SIMPLIFIED</small>
            </span>
          </Link>

          <span>
            © 2026 FIND MALI. Temporary email service.
          </span>

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
