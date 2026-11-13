import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/content/meta";

export const metadata: Metadata = pageMeta({
  title: "Privacy",
  description:
    "What Ram Ganga Agro stores when you write to the farm or follow the harvest notes.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Privacy" }]} />
      <div className="container-page section">
        <h1 className="type-h1">Privacy.</h1>

        <div className="prose-page mt-8">
          <p className="type-caption">
            Draft, written from the data the site actually stores. It needs
            review by the farm, and a professional legal review, before the
            public domain serves it. It is not a claim of compliance with any
            particular law.
          </p>

          <h2 className="type-h2 mt-10">What this site stores</h2>
          <p className="mt-4 text-ink-muted">
            The contact form stores the name, the email address, and the
            message you type, with the time the note arrived. The harvest notes
            form stores the email address in lower case, the time you ticked
            the consent box, which form you used, and a random token kept only
            as a hash so a future unsubscribe link can be matched. Nothing else
            is asked for. There is no phone field, and no account to create on
            the public pages.
          </p>

          <h2 className="type-h2 mt-10">Why it is kept</h2>
          <p className="mt-4 text-ink-muted">
            A contact note is kept so the farm can read it. A reply, if there
            is one, is sent outside this website. A harvest-note address is
            kept so the farm can write later. Nothing is emailed yet. The
            details are not sold, and they are not used to build an advertising
            profile.
          </p>

          <h2 className="type-h2 mt-10">What is not stored</h2>
          <p className="mt-4 text-ink-muted">
            No payment details, because nothing is for sale. No address, no
            phone number, and no advertising or analytics profile. Server logs
            record requests for operational reasons and exclude credentials,
            tokens and message bodies.
          </p>

          <h2 className="type-h2 mt-10">How long it is kept</h2>
          <p className="mt-4 text-ink-muted">
            Contact notes and harvest-note addresses stay until the farm erases
            them, or until an address is removed from the list. No automatic
            deletion date is configured. The short-lived submission counter
            described below expires on its own, after about an hour.
          </p>

          <h2 className="type-h2 mt-10">Submission limits</h2>
          <p className="mt-4 text-ink-muted">
            Each form is counted against the network address, in a separate
            record, so it cannot be sent without limit. That record is not the
            email address. It is kept for about an hour.
          </p>

          <h2 className="type-h2 mt-10">A short-lived cookie</h2>
          <p className="mt-4 text-ink-muted">
            After the harvest-notes form is accepted, the browser keeps a
            cookie named <code>rga_followed</code> for ten minutes. It lets the
            next page say that the form was sent. It does not contain the email
            address.
          </p>

          <h2 className="type-h2 mt-10">Services that see a visit</h2>
          <p className="mt-4 text-ink-muted">
            The pages load Clerk so an invited operator can sign in. A public
            visit does not ask you to create an account. Clerk may receive a
            technical request, and may set a cookie, when its script loads.
            That is for sign-in, not for advertising. The records themselves
            sit in a Postgres database. The current development database is
            hosted by Neon. A production database has not been created. If that
            host changes, this page should be updated before the public domain
            serves it. No analytics product is installed.
          </p>

          <h2 className="type-h2 mt-10">Email</h2>
          <p className="mt-4 text-ink-muted">
            The farm does not send email yet. Ticking the consent box adds the
            address to a list that is not being mailed. You can remove an
            address at any time on the{" "}
            <Link href="/unsubscribe" className="text-link">
              unsubscribe page
            </Link>
            , without waiting for a message to arrive.
          </p>

          <h2 className="type-h2 mt-10">Who can read a contact message</h2>
          <p className="mt-4 text-ink-muted">
            The website can add a message to the inbox and cannot read it back.
            Reading the inbox is a separate operator task, run with a database
            login that may only read messages, and only after the reason for
            the reading has been written to an append-only audit record. The
            script is <code>scripts/read-contact-messages.ts</code>. There is no
            page on this site that lists messages.
          </p>

          <h2 className="type-h2 mt-10">Deletion</h2>
          <p className="mt-4 text-ink-muted">
            Ask through the{" "}
            <Link href="/contact" className="text-link">
              contact form
            </Link>{" "}
            and say which address should be erased. An operator runs{" "}
            <code>scripts/erase-contact.ts</code>, which deletes that address’s
            contact messages and subscriber row with a database login that
            exists only for erasure, and records that the erasure happened.
            Self-serve deletion arrives with accounts, which this site does not
            have yet.
          </p>

          <h2 className="type-h2 mt-10">Changes</h2>
          <p className="mt-4 text-ink-muted">
            If this page changes, the new version replaces this one here.
          </p>
        </div>
      </div>
    </>
  );
}
