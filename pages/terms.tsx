
import Head from 'next/head';
import Link from 'next/link';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Use | FIND MALI</title>
        <meta
          name="description"
          content="Terms and conditions for using FIND MALI."
        />
      </Head>

      <main className="legal-shell">
        <Link href="/" className="back-link">
          ← Back to FIND MALI
        </Link>

        <span className="section-kicker">LEGAL</span>

        <h1>Terms of Use</h1>

        <p className="legal-updated">
          Updated: 18 November 2026
        </p>

        <section>
          <h2>1. About the Service</h2>
          <p>
            FIND MALI provides temporary email addresses
            for receiving incoming email messages.
            The service is intended for temporary and
            non-sensitive communications.
          </p>
        </section>

        <section>
          <h2>2. Temporary Email Addresses</h2>
          <p>
            Email addresses provided by FIND MALI are
            temporary. Inbox availability and message
            access may be limited by the service's
            configured session and retention periods.
          </p>
          <p>
            Users should not rely on temporary inboxes
            for important communications, account recovery
            or long-term storage.
          </p>
        </section>

        <section>
          <h2>3. Acceptable Use</h2>
          <p>
            Users must not use FIND MALI to engage in
            unlawful activity, abuse, fraud, harassment,
            spam or attempts to interfere with the service.
          </p>
          <p>
            Users are responsible for ensuring that their
            use of the service complies with applicable laws.
          </p>
        </section>

        <section>
          <h2>4. Availability</h2>
          <p>
            FIND MALI may update, restrict, suspend or
            discontinue parts of the service when necessary
            for maintenance, security or operational reasons.
          </p>
        </section>

        <section>
          <h2>5. Privacy</h2>
          <p>
            Information about data processing, security
            and retention is explained in our Privacy Policy.
          </p>
          <p>
            <Link href="/privacy">
              Read our Privacy Policy
            </Link>
          </p>
        </section>

        <section>
          <h2>6. Service Limitations</h2>
          <p>
            FIND MALI does not guarantee that every
            incoming message will be received, delivered
            or remain available for a particular period.
          </p>
        </section>

        <section>
          <h2>7. Changes to These Terms</h2>
          <p>
            These Terms may be updated when the service
            or its requirements change. Updated terms
            will be published on this page.
          </p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>
            For questions about these Terms, contact:
          </p>
          <p>
            <a href="mailto:support@findmali.com">
              support@findmali.com
            </a>
          </p>
        </section>

        <p className="legal-note">
          Please review these Terms together with the
          FIND MALI Privacy Policy.
        </p>
      </main>
    </>
  );
}
