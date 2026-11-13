import type { ReactNode } from "react";
import { DecorativeMark } from "@/components/illustrations/DecorativeMark";

export function JournalEmpty({ children }: { children?: ReactNode }) {
  return (
    <div className="max-w-[40rem] border-t border-green pt-8">
      <h2 className="type-h2">The journal is just beginning.</h2>
      <p className="mt-4 text-ink-muted">
        When there is a season to record, it will be recorded here.
      </p>
      <DecorativeMark id="seasonal-line" className="mt-8 h-8 w-full max-w-sm" />
      {children}
    </div>
  );
}
