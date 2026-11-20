import { farmLocation, trustDetails } from "@/content/contact-config";

const rows = [
  { label: "Place", value: farmLocation },
  { label: "FSSAI", value: trustDetails.fssai },
  { label: "GSTIN", value: trustDetails.gstin },
  { label: "Postal address", value: trustDetails.postalAddress },
] as const;

export function TrustBlock() {
  const visible = rows.filter((row) => row.label === "Place" || row.value.length > 0);
  if (visible.length === 0) return null;

  return (
    <dl className="mt-8 grid gap-3 text-sm text-ink-muted">
      {visible.map((row) => (
        <div key={row.label} className="grid gap-1 sm:grid-cols-[8rem_1fr]">
          <dt className="text-ink">{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}