import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page section">
      <h1 className="type-h1">That page is not here.</h1>
      <div className="prose-page mt-8">
        <p className="text-ink-muted">
          The address may be old, or the page may not have been written yet.
        </p>
        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/" className="text-link">
            Back to the farm
          </Link>
          <Link href="/our-farm" className="text-link">
            Our farm
          </Link>
          <Link href="/grow" className="text-link">
            What we grow
          </Link>
        </p>
      </div>
    </div>
  );
}
