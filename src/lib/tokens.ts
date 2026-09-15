/**
 * Tokens for confirm, unsubscribe and approve links.
 *
 * The database stores only sha256 of each token. A leaked database therefore
 * cannot confirm a subscription, unsubscribe anyone, or approve a send: the raw
 * token exists in exactly one place, the email that carried it.
 *
 * Node's crypto rather than Web Crypto because these routes already declare
 * `runtime = 'nodejs'` and timingSafeEqual has no Web Crypto equivalent.
 */

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** 32 random bytes, base64url. ~256 bits, unguessable, URL safe. */
export function newToken(): string {
  return randomBytes(32).toString('base64url');
}

export function sha256hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Hash a value that identifies a person but must never be stored raw: an IP
 * address, or a browser-generated visitor id. Salted, so the hashes cannot be
 * reversed with a rainbow table of every IPv4 address, which is small enough to
 * enumerate in minutes.
 *
 * Falls back to an in-process salt when SUBSCRIBER_HASH_SALT is unset. That
 * makes hashes useless across restarts, which is the correct failure: it
 * degrades an analytics nicety rather than storing identifiable data by
 * accident because someone forgot an env var.
 */
const FALLBACK_SALT = randomBytes(16).toString('hex');

export function pseudonymise(value: string): string {
  const salt = process.env.SUBSCRIBER_HASH_SALT?.trim() || FALLBACK_SALT;
  return createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

/** Constant-time compare of two hex digests. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * The client IP as seen through Vercel's proxy. `x-forwarded-for` is a list and
 * the first entry is the original client. Returns null rather than a guess when
 * there is no header, so a local run does not invent an address.
 */
export function clientIp(headers: Headers): string | null {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim() || null;
  return headers.get('x-real-ip')?.trim() || null;
}
