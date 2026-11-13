import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { metadataFor } from "@/content/seo";

export const metadata: Metadata = metadataFor("/follow");

export default async function FollowPage() {
  // A direct visit must not tell someone they joined.
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
                Nothing will be emailed yet. When the farm starts sending
                harvest notes, they will go to that address.
              </p>
              <p className="mt-6">
                <Link href="/unsubscribe" className="text-link">
                  Remove an address from the list
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="type-h1">Follow the farm.</h1>
            <div className="prose-page mt-8">
              <p className="text-ink-muted">
                Use the form on the homepage to follow the farm.
              </p>
              <p className="mt-6">
                <Link href="/#follow" className="text-link">
                  Go to the form
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
