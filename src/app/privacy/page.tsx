import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { privacyServiceFlags } from "@/content/privacy-services";
import { metadataFor } from "@/content/seo";

export const metadata: Metadata = metadataFor("/privacy");

const LAST_UPDATED = "20 November 2026";

export default function PrivacyPage() {
  const { analytics, transactionalEmail } = privacyServiceFlags();

  return (
    <>
      <Breadcrumbs items={[{ label: "Privacy" }]} path="/privacy" />
      <div className="container-page section">
        <h1 className="type-h1">Privacy</h1>
        <p className="type-caption mt-4">Last updated: {LAST_UPDATED}</p>

        <p className="type-caption mt-2 text-ink-muted">
          TODO: professional legal review before launch.
        </p>

        <div className="prose-page mt-8">
          <p className="text-ink-muted">
            This page explains what Ram Ganga Agro collects on rgagro.me, why it
            is kept, and how you can ask for removal. It is written in plain
            language and matches what the website does today.
          </p>

          <h2 className="type-h2 mt-10">Who we are</h2>
          <p className="mt-4 text-ink-muted">
            Ram Ganga Agro is a farm in Mamoni, Shahbad tehsil, Baran district,
            Rajasthan. You can reach us through the{" "}
            <Link href="/contact" className="text-link">
              contact page
            </Link>
            .
          </p>

          <h2 className="type-h2 mt-10">What we collect</h2>
          <p className="mt-4 text-ink-muted">
            <strong>Contact form.</strong> When you send a message, we store
            your name, email address, message text, and the time it arrived.
          </p>
          <p className="mt-4 text-ink-muted">
            <strong>Harvest waitlist.</strong> When you join the list, we store
            your email (in lower case), which form you used, the time you gave
            consent, and a hashed token so an unsubscribe link can be matched
            later. We do not ask for a phone number on the public site.
          </p>
          {analytics ? (
            <p className="mt-4 text-ink-muted">
              <strong>Analytics.</strong> If you accept analytics cookies,
              Google Analytics 4 may record page views and basic events such as
              contact submits, waitlist signups, and taps on published phone or
              email links. We do not sell this data.
            </p>
          ) : null}

          <h2 className="type-h2 mt-10">Why we use it</h2>
          <ul className="mt-4 list-disc pl-5 text-ink-muted">
            <li>Contact messages — so the farm can read and reply to you.</li>
            <li>
              Waitlist addresses — to send one email when the next harvest is
              available, if you asked for that.
            </li>
            {analytics ? (
              <li>Analytics — to understand how the site is used and fix problems.</li>
            ) : null}
            <li>
              Short-lived technical records — to limit spam on forms (about one
              hour, tied to your network address, not your email).
            </li>
          </ul>

          <h2 className="type-h2 mt-10">Email we send</h2>
          {transactionalEmail ? (
            <p className="mt-4 text-ink-muted">
              After a contact or wholesale enquiry we send one automatic
              confirmation through our email provider (Resend). Waitlist members
              may receive one email per harvest when grain is ready. You can
              unsubscribe any time on the{" "}
              <Link href="/unsubscribe" className="text-link">
                unsubscribe page
              </Link>
              .
            </p>
          ) : (
            <p className="mt-4 text-ink-muted">
              The website stores your messages and waitlist signup. Automatic
              confirmation email is not enabled on this deployment yet. When it
              is, this page will name the provider. You can unsubscribe any time
              on the{" "}
              <Link href="/unsubscribe" className="text-link">
                unsubscribe page
              </Link>
              .
            </p>
          )}

          <h2 className="type-h2 mt-10">Cookies</h2>
          <p className="mt-4 text-ink-muted">
            After a successful waitlist signup, a short-lived cookie (
            <code>rga_followed</code>) for about ten minutes lets the next page
            confirm the form worked. It does not contain your email.
            {analytics
              ? " If you accept analytics, Google Analytics may set its own cookies. You can change your choice from the cookie notice on the site."
              : " No analytics cookies are configured on this deployment."}
          </p>

          <h2 className="type-h2 mt-10">Who can see your data</h2>
          <p className="mt-4 text-ink-muted">
            Contact messages and waitlist entries are stored in a secure
            database operated for the website. Only authorised farm operators
            can read contact messages. Sign-in for operators uses a separate
            authentication service; visitors are not asked to create a public
            account.
            {transactionalEmail ? " Resend processes outbound confirmation mail." : null}
            {analytics ? " Google processes analytics data you consent to." : null}
          </p>

          <h2 className="type-h2 mt-10">How long we keep it</h2>
          <p className="mt-4 text-ink-muted">
            Contact messages and waitlist entries stay until the farm deletes
            them or you unsubscribe. Form rate-limit counters expire after about
            one hour. Server logs for operations exclude message bodies and
            secrets.
          </p>

          <h2 className="type-h2 mt-10">Your choices</h2>
          <p className="mt-4 text-ink-muted">
            You can unsubscribe from harvest emails on the{" "}
            <Link href="/unsubscribe" className="text-link">
              unsubscribe page
            </Link>
            . To ask for deletion of contact messages or your waitlist entry,
            use the{" "}
            <Link href="/contact" className="text-link">
              contact form
            </Link>{" "}
            and tell us which email address to remove.
          </p>

          <h2 className="type-h2 mt-10">Changes</h2>
          <p className="mt-4 text-ink-muted">
            If this policy changes, we will update the date at the top of this
            page.
          </p>
        </div>
      </div>
    </>
  );
}