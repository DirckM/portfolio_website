/**
 * Svix webhook signature verification, done by hand.
 *
 * Resend signs webhooks with Svix. Adding the `svix` package for this would be
 * a dependency for one HMAC, so it is 30 lines here instead.
 *
 * The signature is base64(HMAC-SHA256(`${id}.${timestamp}.${body}`, secret)),
 * where the secret is the part after `whsec_`, base64-decoded. The header can
 * carry several space-separated `v1,<sig>` values during a key rotation, and
 * any one matching is a pass.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

const TOLERANCE_SECONDS = 5 * 60;

export interface SvixHeaders {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
}

export function verifySvix(
  body: string,
  headers: SvixHeaders,
  secret: string | undefined
): { ok: true } | { ok: false; reason: string } {
  if (!secret) return { ok: false, reason: 'no signing secret configured' };
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return { ok: false, reason: 'missing svix headers' };

  // Replay window. Without this a captured request stays valid forever.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: 'bad timestamp' };
  if (Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) {
    return { ok: false, reason: 'timestamp outside tolerance' };
  }

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key)
    .update(`${id}.${timestamp}.${body}`)
    .digest('base64');

  // The header may list several versioned signatures during a rotation.
  const provided = signature
    .split(' ')
    .map(part => part.split(',')[1])
    .filter((v): v is string => Boolean(v));

  const expectedBuf = Buffer.from(expected);
  for (const candidate of provided) {
    const buf = Buffer.from(candidate);
    if (buf.length === expectedBuf.length && timingSafeEqual(buf, expectedBuf)) {
      return { ok: true };
    }
  }
  return { ok: false, reason: 'signature mismatch' };
}
