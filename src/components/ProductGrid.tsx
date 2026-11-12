import { ProductCard } from "@/components/ProductCard";
import type { Crop } from "@/content/crops";

export function ProductGrid({ crops }: { crops: Crop[] }) {
  const single = crops.length === 1;

  return (
    <ul
      className={`grid list-none gap-8 p-0 ${
        single ? "max-w-[720px]" : "md:grid-cols-2"
      }`}
    >
      {crops.map((crop) => (
        <li key={crop.slug}>
          <ProductCard
            name={crop.name}
            summary={crop.summary}
            href={`/grow/${crop.slug}`}
            status={crop.status}
            media={{ src: "/illustrations/panicle.svg", alt: "" }}
            pricePaise={crop.pricePaise}
            purchasable={crop.purchasable}
            layout={single ? "row" : "stacked"}
            titleAs="h2"
          />
        </li>
      ))}
    </ul>
  );
}
