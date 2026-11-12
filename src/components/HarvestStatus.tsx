import { statusLabels, type CropStatus } from "@/content/crops";

/** The status is always a word. Colour alone never carries it. */
export function HarvestStatus({
  status,
  className = "",
}: {
  status: CropStatus;
  className?: string;
}) {
  return <p className={`type-status ${className}`.trim()}>{statusLabels[status]}</p>;
}
