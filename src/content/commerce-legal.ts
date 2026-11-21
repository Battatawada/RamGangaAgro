/**
 * Operator-supplied commerce facts. Empty strings stay hidden on product pages
 * and render as an honest gap on legal pages.
 */
const trim = (value: string | undefined) => value?.trim() ?? "";

export const packLegal = {
  packerName: trim(process.env.NEXT_PUBLIC_PACKER_NAME),
  packerAddress: trim(process.env.NEXT_PUBLIC_PACKER_ADDRESS),
  mrpNote: trim(process.env.NEXT_PUBLIC_MRP_NOTE),
  bestBeforeNote: trim(process.env.NEXT_PUBLIC_BEST_BEFORE_NOTE),
  grievancePhone: trim(process.env.NEXT_PUBLIC_GRIEVANCE_PHONE),
  grievanceEmail: trim(process.env.NEXT_PUBLIC_GRIEVANCE_EMAIL),
} as const;

export const commercePolicy = {
  returns: trim(process.env.COMMERCE_RETURNS_TEXT),
  refunds: trim(process.env.COMMERCE_REFUNDS_TEXT),
  shipping: trim(process.env.COMMERCE_SHIPPING_TEXT),
  deliveryStates: trim(process.env.COMMERCE_DELIVERY_STATES),
} as const;

export function policyOrGap(text: string, label: string): string {
  return text.length > 0 ? text : `The farm has not published ${label} yet.`;
}