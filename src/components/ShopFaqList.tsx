import { shopFaq } from "@/content/shop-faq";

export function ShopFaqList() {
  if (shopFaq.length === 0) return null;

  return (
    <section className="border-t border-line pt-10">
      <h2 className="type-h2">Questions</h2>
      <dl className="mt-6 space-y-6">
        {shopFaq.map((item) => (
          <div key={item.question}>
            <dt className="font-medium">{item.question}</dt>
            <dd className="mt-2 text-ink-muted">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}