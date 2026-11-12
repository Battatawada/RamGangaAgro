import type { ReactNode } from "react";

export function JournalEmpty({ children }: { children?: ReactNode }) {
  return (
    <div className="surface prose-measure p-12">
      <h2 className="type-h2">The journal is just beginning.</h2>
      <p className="mt-4 text-ink-muted">
        When there is a season to record, it will be recorded here.
      </p>
      {children}
    </div>
  );
}
