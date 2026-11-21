"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/content/site";

function cartLabel(count: number, base: string): string {
  return count > 0 ? `${base} (${count})` : base;
}

export function NavLinks({
  links,
  cartCount = 0,
}: {
  links: NavLink[];
  cartCount?: number;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-7 text-[15px]">
        {links.map((link) => {
          const current =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-raktshali aria-[current=page]:text-raktshali"
              >
                {link.href === "/cart" ? cartLabel(cartCount, link.label) : link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
