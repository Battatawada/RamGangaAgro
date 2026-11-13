/** Clerk’s strict CSP allows an inline script only with the request nonce. */
export function requestNonce(headerList: Headers): string | undefined {
  const named = headerList.get("x-nonce");
  if (named) return named;
  const csp = headerList.get("content-security-policy") ?? "";
  return csp.match(/'nonce-([^']+)'/)?.[1];
}
