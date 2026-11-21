import Link from "next/link";
import { HeaderAuth } from "@/components/HeaderAuth";
import { MobileMenu } from "@/components/MobileMenu";
import { NavLinks } from "@/components/NavLinks";
import { primaryNav } from "@/content/site";
import { cartItemCount } from "@/server/cart-cookie";
import { flags } from "@/server/flags";

export async function SiteHeader() {
  const links = primaryNav.filter((link) => !link.flag || flags[link.flag]);
  let cartCount = 0;
  if (flags.CHECKOUT_ENABLED) {
    try {
      cartCount = await cartItemCount();
    } catch {
      cartCount = 0;
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/92 backdrop-blur-[2px]">
      <div className="container-page flex h-[72px] items-center justify-between gap-4 lg:gap-6">
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
        <div className="flex items-center gap-4">
          <NavLinks links={links} cartCount={cartCount} />
          {flags.ACCOUNTS_ENABLED ? <HeaderAuth /> : null}
          <MobileMenu links={links} cartCount={cartCount} />
        </div>
      </div>
    </header>
  );
}
