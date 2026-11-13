import { CropEntry } from "@/components/CropEntry";
import type { Crop } from "@/content/crops";
import { mediaById } from "@/content/media";

/** Every published crop, in the order the content record lists them. */
export function CropIndex({
  crops,
  titleAs = "h2",
}: {
  crops: Crop[];
  titleAs?: "h2" | "h3";
}) {
  return (
    <ul className="mt-12 grid list-none gap-y-12 p-0">
      {crops.map((crop) => {
        const drawing = mediaById(crop.mediaId);
        return (
          <li key={crop.slug}>
            <CropEntry
              name={crop.name}
              summary={crop.summary}
              href={`/grow/${crop.slug}`}
              status={crop.status}
              tone={crop.tone}
              media={{
                src: drawing?.src ?? "/illustrations/panicle.svg",
                alt: drawing?.alt ?? "",
              }}
              pricePaise={crop.pricePaise}
              purchasable={crop.purchasable}
              titleAs={titleAs}
            />
          </li>
        );
      })}
    </ul>
  );
}
