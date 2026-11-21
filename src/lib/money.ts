/** Formats integer paise as INR. Never divide until display time. */
export function formatPaise(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

export function netQuantityLabel(input: {
  weightGrams: number | null;
  volumeMl: number | null;
}): string | null {
  if (input.weightGrams != null && input.weightGrams > 0) {
    if (input.weightGrams >= 1000 && input.weightGrams % 1000 === 0) {
      return `${input.weightGrams / 1000} kg`;
    }
    return `${input.weightGrams} g`;
  }
  if (input.volumeMl != null && input.volumeMl > 0) {
    if (input.volumeMl >= 1000 && input.volumeMl % 1000 === 0) {
      return `${input.volumeMl / 1000} L`;
    }
    return `${input.volumeMl} ml`;
  }
  return null;
}