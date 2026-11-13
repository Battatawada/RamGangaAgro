import Link from "next/link";
import { footerLegalNav, primaryNav, site } from "@/content/site";
import { flags } from "@/server/flags";

export function SiteFooter() {
  const links = primaryNav.filter((link) => !link.flag || flags[link.flag]);

  return (
    <footer className="border-t border-line">
      <div className="container-page pt-12 pb-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_auto_auto] md:items-start md:gap-16">
          <div className="max-w-[28ch]">
            <p className="font-display text-[1.35rem] tracking-[-0.02em]">{site.name}</p>
            <p className="mt-3 text-ink-muted">Ram Ganga Agro practices natural farming.</p>
            <p className="type-caption mt-4">{site.domain}</p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
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
          <nav aria-label="Legal">
            <ul className="flex flex-col gap-1">
              {footerLegalNav.map((link) => (
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
      </div>
    </footer>
  );
}
