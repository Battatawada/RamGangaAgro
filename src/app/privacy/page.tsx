import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Ram Ganga Agro stores when you write to the farm or follow the harvest notes.",
};

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Privacy" }]} />
      <div className="container-page section">
        <h1 className="type-h1">Privacy.</h1>

        <div className="prose-page mt-8">
          <p className="type-caption">
            Draft, written by the implementer from the data the site actually
            stores. It is waiting for review by the farm’s reviewer. It is not
            a claim of compliance with any particular law.
          </p>

          <h2 className="type-h2 mt-10">What this site stores</h2>
          <p className="mt-4 text-ink-muted">
            The contact form stores the name, the email address and the message
            you type, with the time the note arrived. The harvest notes form
            stores the email address in lower case, the time you ticked the
            consent box, which form you used, and a random token kept only as a
            hash so a future unsubscribe link can be matched. Nothing else is
            asked for. There is no phone field, and no account to create.
          </p>

          <h2 className="type-h2 mt-10">What is not stored</h2>
          <p className="mt-4 text-ink-muted">
            No payment details, because nothing is for sale. No address, no
            phone number, and no advertising or analytics profile. Server logs
            record requests for operational reasons and exclude credentials,
            tokens and message bodies.
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
