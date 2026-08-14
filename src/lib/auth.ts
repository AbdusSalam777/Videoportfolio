import crypto from "node:crypto";

export const SESSION_COOKIE = "vp_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    throw new Error(
      "SESSION_SECRET is not set. Add a long random value to .env.local"
    );
  }
  return s;
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

/** Builds a simple `payload.signature` token — no external deps needed. */
export function createSessionToken() {
  const payload = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return false;
  return Number(payload) > Date.now();
}

/**
 * Route-level auth guard for endpoints that must bypass the proxy — the proxy
 * caps request bodies at 10MB, which truncates video uploads.
 */
export function hasValidSession(req: { cookies: { get(name: string): { value: string } | undefined } }) {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;

/**
 * Whether to mark the session cookie `Secure`.
 *
 * Browsers drop Secure cookies sent over plain HTTP, so leaving this on while
 * the site is served from a bare IP with no TLS makes admin login fail
 * silently — you log in and land straight back on the login page. Set
 * COOKIE_SECURE=false in that case, and turn it back on once HTTPS is live.
 */
export function useSecureCookie() {
  const flag = process.env.COOKIE_SECURE;
  if (flag === "false") return false;
  if (flag === "true") return true;
  return process.env.NODE_ENV === "production";
}
