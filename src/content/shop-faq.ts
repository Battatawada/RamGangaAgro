export type ShopFaqItem = { question: string; answer: string };

/** Only entries with both question and answer are shown. */
export const shopFaq: ShopFaqItem[] = [
  {
    question: "Where do parcels ship from?",
    answer: "",
  },
  {
    question: "How long does delivery take?",
    answer: "",
  },
  {
    question: "What if something arrives damaged?",
    answer: "",
  },
].filter((item) => item.question.trim() && item.answer.trim());