/**
 * The link a kit email hands over: the kit's page, unlocked for that one
 * subscriber.
 *
 * The welcome email (first confirmation) and the "already subscribed" email
 * (someone on the list who asked again from a kit form) both carry the kit.
 * An issue has a per-send designs token for this, but these emails are not
 * issue sends, so each gets its own token here: random, stored only as its
 * sha256 in portfolio.giveaway_tokens, and never the unsubscribe token. A
 * forwarded copy can download a free zip and make share links in that
 * subscriber's name. It cannot take anyone off the list.
 *
 * FAILS SOFT. giveaway_tokens comes from 20260929_0001_kit_pages.sql. Until
 * that is applied the insert fails, and the email falls back to the zip
 * itself, which is what these emails linked before the page existed. A link
 * to the page with a token that was never stored would open the signup form
 * for someone who just signed up, which is worse than no page.
 */

import { pgInsert } from '@/lib/db';
import { kitPageUrl, kitWithPage, kitId, type Kit } from '@/lib/kits';
import { newToken, sha256hex } from '@/lib/tokens';

export type KitEmailKind = 'welcome' | 'already-subscribed';

export interface KitTokenStore {
  /** False when the row could not be stored. */
  saveKitToken(row: {
    tokenHash: string;
    giveaway: string;
    subscriberId: string;
    emailKind: KitEmailKind;
  }): Promise<boolean>;
}

export const kitTokenDb: KitTokenStore = {
  async saveKitToken(r) {
    const res = await pgInsert(
      'giveaway_tokens',
      {
        token_hash: r.tokenHash,
        giveaway: r.giveaway,
        subscriber_id: r.subscriberId,
        email_kind: r.emailKind,
      },
      { returning: false }
    );
    if (!res.ok)
      console.error('kit token not stored, linking the zip:', res.error);
    return res.ok;
  },
};

/**
 * Where the kit button in this subscriber's email points. A kit with a page
 * gets the page with a fresh token. Anything else (an issue's designs zip, a
 * kit without a page, no subscriber id) keeps the zip link it always had.
 */
export async function kitEmailLink(
  store: KitTokenStore,
  kit: Kit,
  subscriberId: string | null | undefined,
  emailKind: KitEmailKind
): Promise<string> {
  if (!subscriberId || !kit.sourcePrefix.startsWith('kit:')) return kit.href;
  if (!kitWithPage(kitId(kit))) return kit.href;
  const token = newToken();
  const saved = await store.saveKitToken({
    tokenHash: sha256hex(token),
    giveaway: `kit:${kitId(kit)}`,
    subscriberId,
    emailKind,
  });
  return saved ? kitPageUrl(kit, token) : kit.href;
}
