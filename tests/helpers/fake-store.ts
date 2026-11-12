/**
 * A stand-in for the subscriber and inbox tables that keeps the same rules the
 * SQL does: one row per address, a repeat signup does not duplicate, and an
 * unsubscribe only stamps a row that exists.
 */
export type SubscriberRow = {
  email: string;
  consentAt: Date;
  unsubscribedAt: Date | null;
  source: string;
  tokenHash: string;
};

export type ContactRow = { name: string; email: string; message: string };

export function createFakeStore() {
  const subscribers = new Map<string, SubscriberRow>();
  const contactMessages: ContactRow[] = [];

  return {
    subscribers,
    contactMessages,

    async insertContactMessage(input: ContactRow) {
      contactMessages.push(input);
    },

    async subscribeEmail(input: {
      email: string;
      source: string;
      tokenHash: string;
    }) {
      const existing = subscribers.get(input.email);
      if (!existing) {
        subscribers.set(input.email, {
          email: input.email,
          consentAt: new Date(),
          unsubscribedAt: null,
          source: input.source,
          tokenHash: input.tokenHash,
        });
        return;
      }
      if (existing.unsubscribedAt) {
        existing.unsubscribedAt = null;
        existing.consentAt = new Date();
      }
    },

    async unsubscribeEmail(email: string) {
      const existing = subscribers.get(email);
      if (existing && !existing.unsubscribedAt) {
        existing.unsubscribedAt = new Date();
      }
    },

    reset() {
      subscribers.clear();
      contactMessages.length = 0;
    },
  };
}

export type FakeStore = ReturnType<typeof createFakeStore>;
