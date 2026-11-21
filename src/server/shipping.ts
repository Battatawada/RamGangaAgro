import "server-only";

export type ShippingClass = "dry" | "shelf_stable" | "chilled";

/** Flat shipping in paise while the operator has not defined zones. */
export const DEFAULT_SHIPPING_PAISE = Number(
  process.env.COMMERCE_SHIPPING_PAISE ?? "0",
);

const servicedPinPrefixes = (process.env.COMMERCE_PIN_PREFIXES ?? "32")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

export function shippingClassLabel(shippingClass: ShippingClass): string {
  switch (shippingClass) {
    case "dry":
      return "Travels as a dry parcel.";
    case "shelf_stable":
      return "Travels as a shelf-stable parcel.";
    case "chilled":
      return "Needs chilled delivery. The farm has not opened this lane yet.";
    default:
      return "";
  }
}

export function pinServicesOrder(postalCode: string): boolean {
  const pin = postalCode.trim();
  if (!/^\d{6}$/.test(pin)) return false;
  if (servicedPinPrefixes.length === 0) return true;
  return servicedPinPrefixes.some((prefix) => pin.startsWith(prefix));
}

export function parcelMixAllowed(classes: ShippingClass[]): string | null {
  const hasChilled = classes.includes("chilled");
  const hasOther = classes.some((c) => c !== "chilled");
  if (hasChilled && hasOther) {
    return "Chilled items cannot travel in the same parcel as dry goods.";
  }
  if (hasChilled) {
    return "Chilled items cannot be ordered until the farm names a carrier and delivery area.";
  }
  return null;
}