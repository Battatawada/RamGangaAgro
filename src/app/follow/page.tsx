import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NewsletterForm } from "@/components/NewsletterForm";
import { metadataFor } from "@/content/seo";

export const metadata: Metadata = metadataFor("/follow");

export default async function FollowPage() {
  const joined = (await cookies()).get("rga_followed")?.value === "1";

  return (
    <>
      <Breadcrumbs items={[{ label: "Follow" }]} path="/follow" />
      <div className="container-page section">
        {joined ? (
          <>
            <h1 className="type-h1">You are on the list.</h1>
            <div className="prose-page mt-8">
              <p className="text-ink-muted">
                You will receive one email from Ram Ganga Agro when the next
                harvest of Raktshali rice or wheat is available. Until then, there
                is no other mail.
              </p>
              <p className="mt-6">
                <Link href="/unsubscribe" className="text-link">
                  Remove your address
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="type-h1">First-harvest waitlist</h1>
            <div className="prose-page mt-8 max-w-[40rem]">
              <p className="text-ink-muted">
                One email when the next harvest is ready. No marketing series, no
                weekly mail — just a single note when grain from Mamoni is
                available to enquire about.
              </p>
              <div className="mt-8">
                <NewsletterForm source="homepage" redirectTo="/follow" />
              </div>
              <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                <Link href="/journal" className="text-link">
                  The journal
                </Link>
                <Link href="/grow" className="text-link">
                  What we grow
                </Link>
                <Link href="/contact" className="text-link">
                  Enquire
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}