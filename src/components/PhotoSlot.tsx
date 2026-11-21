import type { ReactNode } from "react";

type Props = {
  label: string;
  children?: ReactNode;
  className?: string;
};

/** Honest frame until the farm supplies a photograph. */
export function PhotoSlot({ label, children, className = "" }: Props) {
  return (
    <figure
      className={`surface flex min-h-[240px] flex-col items-center justify-center gap-3 p-6 text-center ${className}`}
    >
      {children}
      <figcaption className="type-caption max-w-[28ch]">{label}</figcaption>
    </figure>
  );
}