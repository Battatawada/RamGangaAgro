"use client";

import { publicContact } from "@/content/contact-config";
import { trackEvent } from "@/components/Analytics";

export function ContactChannels() {
  const { phone, email, responseTime } = publicContact;
  const showChannels = phone.length > 0 || email.length > 0;

  if (!showChannels && !responseTime) return null;

  return (
    <div className="mt-8 space-y-4 text-ink-muted">
      {showChannels ? (
        <ul className="flex flex-col gap-2">
          {phone ? (
            <li>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="text-link"
                onClick={() => trackEvent("phone_click")}
              >
                {phone}
              </a>
            </li>
          ) : null}
          {email ? (
            <li>
              <a
                href={`mailto:${email}`}
                className="text-link"
                onClick={() => trackEvent("email_click")}
              >
                {email}
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}
      {responseTime ? (
        <p>
          <span className="text-ink">Typical reply time:</span> {responseTime}
        </p>
      ) : null}
    </div>
  );
}