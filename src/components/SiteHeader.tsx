import Link from "next/link";
import { MobileMenu } from "@/components/MobileMenu";
import { NavLinks } from "@/components/NavLinks";
import { primaryNav } from "@/content/site";
import { flags } from "@/server/flags";

export function SiteHeader() {
  const links = primaryNav.filter((link) => !link.flag || flags[link.flag]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/92 backdrop-blur-[2px]">
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link
          href="/"
          className="font-display text-[18px] tracking-[0.14em] no-underline"
        >
          RAM GANGA AGRO
        </Link>
        <NavLinks links={links} />
        <MobileMenu links={links} />
      </div>
    </header>
  );
}
