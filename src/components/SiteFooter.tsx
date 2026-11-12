import Link from "next/link";
import { footerLegalNav, primaryNav, site } from "@/content/site";
import { flags } from "@/server/flags";

export function SiteFooter() {
  const links = primaryNav.filter((link) => !link.flag || flags[link.flag]);

  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col justify-between gap-8 pt-12 pb-16 text-[15px] md:flex-row">
        <div>
          <p className="font-medium">{site.name}</p>
          <p className="text-ink-muted">{site.domain}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {[...links, ...footerLegalNav].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center no-underline hover:text-raktshali"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
