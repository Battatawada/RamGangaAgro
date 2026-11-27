"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";

const CONSENT_KEY = "rga_analytics_consent";
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const SIMPLE_ANALYTICS = process.env.NEXT_PUBLIC_SIMPLE_ANALYTICS?.trim() === "1";
const SIMPLE_SCRIPT = "https://scripts.simpleanalyticscdn.com/latest.js";

type Consent = "granted" | "denied" | null;

type SimpleEvent = (name: string, metadata?: Record<string, string>) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    sa_event?: SimpleEvent;
  }
}

const pendingSimpleEvents: Array<[string, Record<string, string> | undefined]> = [];

function readConsent(): Consent {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

function flushSimpleEvents() {
  const send = window.sa_event;
  if (typeof send !== "function") return;
  for (const [name, metadata] of pendingSimpleEvents.splice(0)) {
    send(name, metadata);
  }
}

export function trackEvent(name: string, params?: Record<string, string>) {
  if (SIMPLE_ANALYTICS) {
    if (typeof window.sa_event === "function") {
      window.sa_event(name, params);
    } else {
      pendingSimpleEvents.push([name, params]);
    }
    return;
  }

  if (!MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export function Analytics({ nonce }: { nonce?: string }) {
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    // Read after mount so the server render and the first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(readConsent());
  }, []);

  const applyConsent = useCallback((value: Exclude<Consent, null>) => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: value === "granted" ? "granted" : "denied",
      });
    }
  }, []);

  if (SIMPLE_ANALYTICS) {
    return (
      <Script
        src={SIMPLE_SCRIPT}
        strategy="afterInteractive"
        nonce={nonce}
        onLoad={flushSimpleEvents}
      />
    );
  }

  if (!MEASUREMENT_ID) return null;

  const enabled = consent === "granted";

  return (
    <>
      {enabled ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
            strategy="afterInteractive"
            nonce={nonce}
          />
          <Script id="rga-ga" strategy="afterInteractive" nonce={nonce}>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('consent', 'default', { analytics_storage: 'denied' });
              gtag('config', '${MEASUREMENT_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {consent === null ? (
        <div
          className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper p-4 shadow-lg"
          role="dialog"
          aria-label="Cookie choices"
        >
          <div className="container-page flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-prose text-sm text-ink-muted">
              We use optional analytics cookies to understand site traffic. See
              the{" "}
              <a href="/privacy" className="text-link">
                privacy page
              </a>
              .
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => applyConsent("granted")}
              >
                Accept analytics
              </button>
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => applyConsent("denied")}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
