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
        <Link href="/" className="flex min-h-11 items-center gap-2.5 no-underline sm:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/mark.svg"
            alt=""
            aria-hidden="true"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span className="font-display text-[15px] tracking-[0.12em] sm:text-[18px] sm:tracking-[0.14em]">
            RAM GANGA AGRO
          </span>
        </Link>
        <NavLinks links={links} />
        <MobileMenu links={links} />
      </div>
    </header>
  );
}
