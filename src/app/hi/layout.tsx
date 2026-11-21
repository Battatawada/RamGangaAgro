import type { ReactNode } from "react";

export default function HindiLayout({ children }: { children: ReactNode }) {
  return <div lang="hi">{children}</div>;
}