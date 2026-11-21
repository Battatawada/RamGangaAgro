import Link from "next/link";
import { farmLocation, filledSocialProfiles, trustDetails } from "@/content/contact-config";
import { footerLegalNav, primaryNav, site } from "@/content/site";
import { flags } from "@/server/flags";

export function SiteFooter() {
  const links = primaryNav.filter((link) => !link.flag || flags[link.flag]);
  const social = filledSocialProfiles();

  return (
    <footer className="border-t border-line">
      <div className="container-page pt-12 pb-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_auto_auto] md:items-start md:gap-16">
          <div className="max-w-[28ch]">
            <p className="font-display text-[1.35rem] tracking-[-0.02em]">{site.name}</p>
            <p className="mt-3 text-ink-muted">
              Ram Ganga Agro practices natural farming. {farmLocation}.
            </p>
            {trustDetails.fssai ? (
              <p className="type-caption mt-3">FSSAI: {trustDetails.fssai}</p>
            ) : null}
            {trustDetails.gstin ? (
              <p className="type-caption">GSTIN: {trustDetails.gstin}</p>
            ) : null}
            <p className="type-caption mt-4">{site.domain}</p>
            {social.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-4">
                {social.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm text-link"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
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
