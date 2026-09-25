/**
 * The real database behind src/lib/designs.ts, over PostgREST.
 *
 * Every read degrades to "nothing found" when the tables do not exist yet
 * (the migration is not applied), so the page renders its visitor state
 * instead of erroring.
 */

import { pgInsert, pgSelect } from '@/lib/db';
import type { DesignsStore } from '@/lib/designs';

const enc = encodeURIComponent;

export const designsDb: DesignsStore = {
  async subscriberForDesignsToken(slug, tokenHash) {
    const send = await pgSelect<{ subscriber_id: string }>(
      'issue_sends',
      `issue_slug=eq.${enc(slug)}&designs_token_hash=eq.${tokenHash}&select=subscriber_id&limit=1`
    );
    const id = send.ok ? send.data[0]?.subscriber_id : undefined;
    if (!id) return null;
    const sub = await pgSelect<{ id: string; status: string }>(
      'subscribers',
      `id=eq.${id}&select=id,status&limit=1`
    );
    return sub.ok ? (sub.data[0] ?? null) : null;
  },

  async eventsFromIpSince(ipHash, sinceIso) {
    const res = await pgSelect<{ id: number }>(
      'design_events',
      `ip_hash=eq.${ipHash}&created_at=gt.${enc(sinceIso)}&select=id`
    );
    return res.ok ? res.data.length : 0;
  },

  async recordEvent(slug, subscriberId, kind, ipHash) {
    const res = await pgInsert(
      'design_events',
      { issue_slug: slug, subscriber_id: subscriberId, kind, ip_hash: ipHash },
      { returning: false }
    );
    // Counting is a nicety. A failed insert must not cost someone the download.
    if (!res.ok) console.error('design event not recorded:', res.error);
  },

  async referralCodeFor(subscriberId) {
    const res = await pgSelect<{ code: string }>(
      'referral_codes',
      `subscriber_id=eq.${subscriberId}&select=code&limit=1`
    );
    return res.ok ? (res.data[0]?.code ?? null) : null;
  },

  async createReferralCode(subscriberId, code) {
    const res = await pgInsert(
      'referral_codes',
      { code, subscriber_id: subscriberId },
      { returning: false }
    );
    return res.ok;
  },

  async referralCodeExists(code) {
    const res = await pgSelect<{ code: string }>(
      'referral_codes',
      `code=eq.${enc(code)}&select=code&limit=1`
    );
    return res.ok && res.data.length > 0;
  },
};
