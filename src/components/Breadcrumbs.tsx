import Link from "next/link";
import { headers } from "next/headers";
import { breadcrumbStructuredData, jsonLd } from "@/content/structured-data";
import { requestNonce } from "@/server/request-nonce";

export type Crumb = { label: string; href?: string };

export async function Breadcrumbs({
  items,
  path,
}: {
  items: Crumb[];
  path: string;
}) {
  const nonce = requestNonce(await headers());
  const data = jsonLd(breadcrumbStructuredData(items, path));

  return (
    <nav aria-label="Breadcrumb" className="container-page pt-6">
      {nonce ? (
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: data }}
        />
      ) : null}
      <ol className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-clay-deep">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="text-link">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
