/**
 * The real database behind src/lib/designs.ts, over PostgREST.
 *
 * Reads degrade to "nothing found" and writes to a logged no-op when a table
 * is missing, so the page keeps rendering and a button press never breaks the
 * download it belongs to.
 */

import { pgInsert, pgPatch, pgSelect } from '@/lib/db';
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

  async buttonEventsFromIpSince(ipHash, sinceIso) {
    const res = await pgSelect<{ id: number }>(
      'button_events',
      `ip_hash=eq.${ipHash}&created_at=gt.${enc(sinceIso)}&select=id`
    );
    return res.ok ? res.data.length : 0;
  },

  async recordButton(e) {
    const res = await pgInsert(
      'button_events',
      {
        page: e.page,
        issue_slug: e.slug,
        kind: e.kind,
        subscriber_id: e.subscriberId,
        share_id: e.shareId,
        visitor_hash: e.visitorHash,
        ip_hash: e.ipHash,
      },
      { returning: false }
    );
    if (!res.ok) console.error('button event not recorded:', res.error);
  },

  async createShareLink(l) {
    const res = await pgInsert(
      'share_links',
      {
        id: l.id,
        issue_slug: l.slug,
        subscriber_id: l.subscriberId,
        method: l.method,
      },
      { returning: false }
    );
    if (!res.ok) console.error('share link not recorded:', res.error);
    return res.ok;
  },

  async setShareMethod(id, subscriberId, method) {
    await pgPatch(
      'share_links',
      `id=eq.${enc(id)}&subscriber_id=eq.${subscriberId}`,
      { method }
    );
  },

  async shareLink(id) {
    const res = await pgSelect<{ issue_slug: string; subscriber_id: string }>(
      'share_links',
      `id=eq.${enc(id)}&select=issue_slug,subscriber_id&limit=1`
    );
    const row = res.ok ? res.data[0] : undefined;
    return row
      ? { slug: row.issue_slug, subscriberId: row.subscriber_id }
      : null;
  },

  async recordVisit(shareId, visitorHash) {
    // One row per browser per link: a repeat visit merges into the same row.
    const res = await pgInsert(
      'share_visits',
      { share_id: shareId, visitor_hash: visitorHash },
      { returning: false, upsertOn: 'share_id,visitor_hash' }
    );
    if (!res.ok) console.error('share visit not recorded:', res.error);
  },

  async markVisitSignedUp(shareId, visitorHash) {
    await pgInsert(
      'share_visits',
      { share_id: shareId, visitor_hash: visitorHash, has_signed_up: true },
      { returning: false, upsertOn: 'share_id,visitor_hash' }
    );
  },
};
