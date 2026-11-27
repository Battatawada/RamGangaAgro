/** Development inbox at Testmail. The namespace is not a secret. The API key is. */

export function testmailAddress(namespace: string, tag: string): string {
  const safeNamespace = namespace.trim();
  const safeTag = tag.trim();
  if (!safeNamespace || !safeTag || safeTag.includes("@") || safeNamespace.includes("@")) {
    throw new Error("Testmail namespace and tag must be plain labels.");
  }
  return `${safeNamespace}.${safeTag}@inbox.testmail.app`;
}

export async function fetchTestmail(tag: string): Promise<{
  emails: Array<{ subject: string; text: string; html: string }>;
} | null> {
  const namespace = process.env.TESTMAIL_NAMESPACE?.trim();
  const apiKey = process.env.TESTMAIL_API_KEY?.trim();
  if (!namespace || !apiKey) return null;

  const url = new URL("https://api.testmail.app/api/json");
  url.searchParams.set("namespace", namespace);
  url.searchParams.set("tag", tag);
  url.searchParams.set("livequery", "true");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Testmail returned ${response.status}.`);
  }
  return response.json() as Promise<{
    emails: Array<{ subject: string; text: string; html: string }>;
  }>;
}
