export function SkipLink() {
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-3 focus:z-50 focus:inline-flex focus:min-h-12 focus:items-center focus:rounded-[2px] focus:border focus:border-green focus:bg-paper-raised focus:px-4 focus:text-ink"
    >
      Skip to content
    </a>
  );
}
