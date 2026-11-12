"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { NavLink } from "@/content/site";

const APP_SHELL_ID = "app-shell";

export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // The page underneath is inert and does not scroll while the panel is open.
  useEffect(() => {
    if (!open) return;

    const shell = document.getElementById(APP_SHELL_ID);
    const previousOverflow = document.body.style.overflow;
    shell?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";

    return () => {
      shell?.removeAttribute("inert");
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Focus moves to the first link on open and returns to Menu on close.
  useEffect(() => {
    if (!open) return;
    const menuButton = buttonRef.current;
    const first = panelRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    return () => menuButton?.focus();
  }, [open]);

  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-quiet lg:hidden"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        Menu
      </button>

      {/* The panel only exists after a click, so document is available. */}
      {open
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-0 z-50 overflow-y-auto bg-paper"
              onKeyDown={onPanelKeyDown}
            >
              <div className="container-page flex h-[72px] items-center justify-between border-b border-line">
                <span className="font-display text-[18px] tracking-[0.14em]">
                  RAM GANGA AGRO
                </span>
                <button type="button" className="btn btn-quiet" onClick={close}>
                  Close
                </button>
              </div>
              <nav aria-label="Primary" className="container-page py-10">
                <ul className="flex flex-col gap-6">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={close}
                        className="inline-flex min-h-12 items-center font-display text-[clamp(2rem,6vw,2.75rem)] leading-tight"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
