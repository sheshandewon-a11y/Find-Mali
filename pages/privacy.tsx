
import Head from 'next/head';
import Link from 'next/link';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | FIND MALI</title>
        <meta
          name="description"
          content="FIND MALI Privacy Policy and support contact information."
        />
      </Head>

      <main className="legal-shell">
        <Link href="/" className="back-link">
          ← Back to FIND MALI
        </Link>

        <span className="section-kicker">LEGAL</span>

        <h1>Privacy Policy</h1>

        <p className="legal-updated">
          Updated: 18 November 2026
        </p>

        <section>
          <h2>1. About FIND MALI</h2>
          <p>
            FIND MALI is a temporary email service that allows
            users to generate temporary email addresses and
            receive incoming emails.
          </p>
        </section>

        <section>
          <h2>2. Email Service</h2>
          <p>
            FIND MALI provides temporary email addresses for
            receiving incoming messages. These addresses are
            intended for temporary use and should not be used
            for important personal or confidential communications.
          </p>
        </section>

        <section>
          <h2>3. Information and Data</h2>
          <p>
            Information processed by the service may include
            temporary email addresses, incoming email information,
            technical information and service activity data.
          </p>
          <p>
            The exact information collected, its purposes and
            retention periods should be explained transparently
            as the service's data collection features are finalized.
          </p>
        </section>

        <section>
          <h2>4. Data Retention and Security</h2>
          <p>
            FIND MALI aims to retain information only for as long
            as necessary to operate the service, provide support
            and protect against misuse.
          </p>
          <p>
            Appropriate security measures are intended to protect
            stored information from unauthorized access.
          </p>
        </section>

        <section>
          <h2>5. Third-Party Services</h2>
          <p>
            FIND MALI uses third-party infrastructure and services
            to operate its website, process incoming email and
            provide security features.
          </p>
        </section>

        <section>
          <h2>6. Contact</h2>
          <p>
            If you have questions, concerns or requests regarding
            this Privacy Policy or the FIND MALI service, contact
            our support team:
          </p>
          <p>
            <a href="mailto:support@findmali.com">
              support@findmali.com
            </a>
          </p>
        </section>

        <p className="legal-note">
          This policy should be reviewed and finalized to reflect
          the actual data collection, processing, retention and
          security practices of FIND MALI before production use.
        </p>
      </main>
    </>
  );
}
