/**
 * Drives the local development site in Chrome.
 * Reads the test password from .verify-clerk.local and never prints it.
 *
 *   node scripts/verify-browser.mjs
 */
import { createHmac } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const playwrightModule = process.env.PLAYWRIGHT_CORE
  ? pathToFileURL(process.env.PLAYWRIGHT_CORE).href
  : "playwright-core";
const imported = await import(playwrightModule);
const chromium = imported.chromium ?? imported.default?.chromium;

const base = process.env.VERIFY_BASE ?? "http://localhost:3000";
const results = [];

function record(name, ok, detail = "") {
  results.push({ name, ok, detail: String(detail).slice(0, 180) });
  if (!ok) console.error(`FAIL ${name} ${detail}`);
}

function readEnv(path) {
  const values = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    values[line.slice(0, index)] = line.slice(index + 1);
  }
  return values;
}

function writeVerify(values) {
  writeFileSync(
    ".verify-clerk.local",
    `${Object.entries(values)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")}\n`,
  );
}

const local = readEnv(".env.local");
const stored = readEnv(".verify-clerk.local");
const secret = local.CLERK_SECRET_KEY;

async function clerk(path, method, body) {
  const response = await fetch(`https://api.clerk.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: response.status, json };
}

function totpCode(secretValue) {
  const key = /^[A-Z2-7]+=*$/i.test(secretValue)
    ? base32Decode(secretValue)
    : Buffer.from(secretValue, "base64");
  const counter = Math.floor(Date.now() / 30000);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0xf;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

function base32Decode(input) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.replace(/=+$/g, "").toUpperCase();
  let bits = "";
  for (const char of clean) {
    const value = alphabet.indexOf(char);
    if (value < 0) continue;
    bits += value.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

async function setRole(role) {
  const response = await clerk(`/users/${stored.USER_ID}/metadata`, "PATCH", {
    public_metadata: { role },
  });
  return response.status === 200;
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();

try {
  if (process.env.VERIFY_CLERK_ONLY !== "1") {
  const widths = [360, 390, 768, 1024, 1280, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(`${base}/`, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    record(`home-${width}`, response?.status() === 200 && !overflow, response?.status());
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  const publicPaths = [
    "/",
    "/our-farm",
    "/our-farm/story",
    "/our-farm/the-land",
    "/our-farm/practices",
    "/grow",
    "/grow/raktshali-rice",
    "/journal",
    "/contact",
    "/follow",
    "/unsubscribe",
    "/privacy",
    "/terms",
  ];
  for (const path of publicPaths) {
    const response = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
    record(`public${path}`, response?.status() === 200, response?.status());
  }

  const missingJournal = await page.goto(`${base}/journal/not-a-real-slug`, {
    waitUntil: "domcontentloaded",
  });
  record("missing-journal-404", missingJournal?.status() === 404, missingJournal?.status());

  for (const path of ["/shop", "/cart", "/checkout", "/account", "/admin", "/harvest/demo"]) {
    const response = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
    record(`dormant${path}`, response?.status() === 404, response?.status());
  }

  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  const homeHtml = await page.content();
  record("nav-omits-shop", !homeHtml.includes('href="/shop"'));
  record("nav-omits-cart", !homeHtml.includes('href="/cart"'));
  record("nav-omits-account", !homeHtml.includes('href="/account"'));
  record("nav-omits-sign-in", !homeHtml.includes('href="/sign-in"'));
  record("home-not-for-sale", homeHtml.includes("It is not for sale."));
  record("home-no-rupee", !homeHtml.includes("₹"));

  const sitemap = await page.goto(`${base}/sitemap.xml`, { waitUntil: "domcontentloaded" });
  const sitemapText = await page.content();
  record("sitemap-200", sitemap?.status() === 200, sitemap?.status());
  record(
    "sitemap-omits-dormant",
    !sitemapText.includes("/shop") &&
      !sitemapText.includes("/cart") &&
      !sitemapText.includes("/admin") &&
      !sitemapText.includes("/account"),
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const menuButton = page.getByRole("button", { name: "Menu" });
  await menuButton.click();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  record("menu-opens", await dialog.isVisible());
  record("menu-expanded", (await menuButton.getAttribute("aria-expanded")) === "true");
  const focusInDialog = await page.evaluate(() => {
    const dialogNode = document.querySelector("[role=dialog]");
    return !!dialogNode && dialogNode.contains(document.activeElement);
  });
  record("menu-focus-moves-in", focusInDialog);
  const inert = await page.locator("#app-shell").getAttribute("inert");
  record("menu-page-inert", inert !== null);
  await page.keyboard.press("Tab");
  const stillInDialog = await page.evaluate(() => {
    const dialogNode = document.querySelector("[role=dialog]");
    return !!dialogNode && dialogNode.contains(document.activeElement);
  });
  record("menu-focus-stays", stillInDialog);
  await page.keyboard.press("Escape");
  record("menu-escape-closes", !(await dialog.isVisible().catch(() => false)));
  const returned = await page.evaluate(
    () => document.activeElement?.textContent?.trim() === "Menu",
  );
  record("menu-focus-returns", returned);
  const menuOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  record("menu-no-horizontal-overflow", !menuOverflow);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${base}/contact`, { waitUntil: "networkidle" });
  const nativeInvalid = await page.locator("#contact-name").evaluate((input) => {
    input.form?.requestSubmit();
    return input.validity.valueMissing === true;
  });
  record("contact-empty-blocked", nativeInvalid);
  await page.locator("form").evaluate((form) => form.setAttribute("novalidate", ""));
  await page.locator("#contact-name").fill("A Reader");
  await page.locator("#contact-email").fill("reader@example.com");
  await page.locator("#contact-message").fill("Too short");
  await page.getByRole("button", { name: "Send" }).click();
  await page.getByText("Write at least a sentence.").waitFor({ timeout: 8000 });
  record("contact-short-message-rejected", true);
  await page.locator("#contact-message").fill("This is a sentence for the farm.");
  await page.locator("input[name=company]").evaluate((input) => {
    input.hidden = false;
    input.value = "spam";
  });
  await page.getByRole("button", { name: "Send" }).click();
  await page.getByText("The note was not sent.").waitFor({ timeout: 8000 });
  record("contact-honeypot-rejected", true);

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.locator("#newsletter-email-homepage").fill("not-an-email");
  await page.locator("#newsletter-email-homepage").evaluate((input) => {
    input.form?.setAttribute("novalidate", "");
  });
  await page.getByRole("button", { name: "Join the farm journal" }).click();
  await page.getByText("Enter an email address.").waitFor({ timeout: 8000 });
  record("newsletter-invalid-email", true);

  await page.goto(`${base}/unsubscribe`, { waitUntil: "networkidle" });
  await page.locator("#unsubscribe-email").fill("nobody@example.com");
  await page.getByRole("button", { name: "Remove this address" }).click();
  await page.waitForTimeout(800);
  const unsubscribeText = await page.locator("[aria-live=polite]").innerText();
  record(
    "unsubscribe-without-redis-fails-closed",
    unsubscribeText.includes("too often") || unsubscribeText.includes("If this address was on the list"),
    unsubscribeText,
  );
  }

  await page.goto(`${base}/sign-up`, { waitUntil: "domcontentloaded" });
  await page
    .getByText(/sign ups are currently disabled|access restricted/i)
    .first()
    .waitFor({ timeout: 20000 })
    .catch(() => {});
  const signupText = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  record(
    "signup-restricted",
    /sign ups are currently disabled|access restricted/i.test(signupText),
    signupText.slice(0, 180),
  );

  const anonymous = await page.request.get(`${base}/api/internal-verify-admin`);
  const anonymousBody = await anonymous.json();
  record(
    "anonymous-admin-refused",
    anonymous.status() === 200 && anonymousBody?.ok === false && anonymousBody?.reason === "no_session",
    anonymousBody?.reason,
  );

  async function signIn(withCode) {
    await page.goto(`${base}/sign-in`, { waitUntil: "domcontentloaded" });
    await page.locator("input[name=identifier]").waitFor({ timeout: 20000 });
    await page.locator("input[name=identifier]").fill(stored.EMAIL);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.locator("input[name=password]").waitFor({ timeout: 15000 });
    await page.locator("input[name=password]").fill(stored.PASSWORD);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    const verification = page.getByLabel("Enter verification code");
    if (await verification.waitFor({ timeout: 8000 }).then(() => true).catch(() => false)) {
      const prompt = await page.locator("body").innerText();
      if (/check your email/i.test(prompt)) {
        await verification.click();
        await page.keyboard.type("424242", { delay: 40 });
        const continueButton = page.getByRole("button", { name: "Continue", exact: true });
        if (await continueButton.isVisible().catch(() => false)) await continueButton.click();
      }
    }
    if (withCode) {
      await page
        .waitForFunction(() => !/check your email/i.test(document.body.innerText), null, {
          timeout: 15000,
        })
        .catch(() => {});
      const codeField = page.getByLabel("Enter verification code");
      await codeField.waitFor({ timeout: 15000 });
      await codeField.click();
      await page.keyboard.type(totpCode(readEnv(".verify-clerk.local").TOTP_SECRET), { delay: 40 });
      const continueButton = page.getByRole("button", { name: "Continue", exact: true });
      if (await continueButton.isVisible().catch(() => false)) await continueButton.click();
    }
    try {
      await page.waitForFunction(() => Boolean(window.Clerk?.user), null, { timeout: 20000 });
    } catch {
      const text = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 180);
      return text;
    }
    await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
    return true;
  }

  const hasTotp = Boolean(readEnv(".verify-clerk.local").TOTP_SECRET);
  const signedIn = await signIn(hasTotp);
  record("browser-password-sign-in", signedIn === true, signedIn === true ? "" : signedIn);

  if (signedIn === true && !hasTotp) {
    record("set-admin-for-first-factor", await setRole("admin"));
    const firstFactor = await page.evaluate(() =>
      fetch("/api/internal-verify-admin").then((response) => response.json()),
    );
    record(
      "first-factor-admin-refused",
      firstFactor.ok === false && firstFactor.reason === "no_second_factor",
      firstFactor.reason,
    );
    record("role-returned-to-customer", await setRole("customer"));

    const enrolled = await page.evaluate(async () => {
      if (window.Clerk.user.twoFactorEnabled) return { already: true };
      const totp = await window.Clerk.user.createTOTP();
      return { secret: totp.secret };
    });
    if (enrolled.already) {
      record("browser-totp-enrolled", true, "already");
    } else if (enrolled.secret) {
      writeVerify({ ...readEnv(".verify-clerk.local"), TOTP_SECRET: enrolled.secret });
      const verified = await page.evaluate(async (code) => {
        await window.Clerk.user.verifyTOTP({ code });
        await window.Clerk.user.reload();
        return window.Clerk.user.twoFactorEnabled === true;
      }, totpCode(enrolled.secret));
      record("browser-totp-enrolled", verified === true);
    } else {
      record("browser-totp-enrolled", false, "no-secret");
    }

    await page.evaluate(() => window.Clerk.signOut());
    await page.waitForTimeout(1000);
    const afterSignOut = await page.evaluate(() =>
      fetch("/api/internal-verify-admin").then((response) => response.json()),
    );
    record("sign-out-clears-admin", afterSignOut.reason === "no_session", afterSignOut.reason);

    await signIn(true);
  }

  if (signedIn === true && hasTotp) {
    await page.waitForFunction(() => Boolean(window.Clerk?.user), null, { timeout: 15000 });
    const factor = await page.evaluate(() => ({
      twoFactor: window.Clerk?.user?.twoFactorEnabled === true,
    }));
    record("browser-second-factor-sign-in", factor.twoFactor === true);

    const customerGate = await page.evaluate(() =>
      fetch("/api/internal-verify-admin").then((response) => response.json()),
    );
    record(
      "second-factor-customer-refused",
      customerGate.ok === false && customerGate.reason === "not_admin",
      customerGate.reason,
    );

    record("assign-admin", await setRole("admin"));
    const adminGate = await page.evaluate(() =>
      fetch("/api/internal-verify-admin").then((response) => response.json()),
    );
    record("live-admin-admitted", adminGate.ok === true, adminGate.reason ?? "ok");

    record("revoke-admin", await setRole("customer"));
    const revoked = await page.evaluate(() =>
      fetch("/api/internal-verify-admin").then((response) => response.json()),
    );
    record(
      "stale-session-admin-revoked",
      revoked.ok === false && revoked.reason === "not_admin",
      revoked.reason,
    );

    const homeAfter = await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
    record("ordinary-access-after-revoke", homeAfter?.status() === 200, homeAfter?.status());

    await page.evaluate(() => window.Clerk?.signOut());
  }
} catch (error) {
  record("browser-threw", false, error instanceof Error ? error.message : "error");
} finally {
  await setRole("customer").catch(() => {});
  await browser.close();
}

const failed = results.filter((item) => !item.ok);
console.log(JSON.stringify({ passed: results.length - failed.length, failed: failed.length, results }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);
