'use client';

import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import NewsletterSignup from './NewsletterSignup';

/**
 * The buttons on /designs/<slug>.
 *
 * A subscriber (valid token or cookie) downloads directly and can share a
 * public link. Anyone else gets the newsletter form, and the zip arrives in
 * the welcome email. Every count happens here, from a click, via POST: the
 * page's GET is opened by mail scanners too and must count nothing.
 */
export default function DesignsActions({
  slug,
  state,
  refCode,
  hasTokenInUrl,
  size,
  title,
}: {
  slug: string;
  state: 'subscriber' | 'visitor';
  refCode: string | null;
  hasTokenInUrl: boolean;
  size: string;
  title: string;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState<'download' | 'share' | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('t');
    if (token) {
      // Keep the access in an HttpOnly cookie, then take the personal token
      // out of the address bar so it cannot be copied into a share by hand.
      fetch('/api/designs/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, token }),
      }).finally(() => {
        url.searchParams.delete('t');
        window.history.replaceState(
          null,
          '',
          url.pathname + (url.search || '') + url.hash
        );
      });
    }
    if (posthog.__loaded) {
      posthog.capture('designs_page_view', {
        issue: slug,
        has_token: hasTokenInUrl || state === 'subscriber',
        has_ref: Boolean(refCode),
      });
    }
  }, [slug, state, refCode, hasTokenInUrl]);

  async function post(kind: 'download' | 'share'): Promise<string | null> {
    setBusy(kind);
    setNote(null);
    try {
      const res = await fetch(`/api/designs/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote(body.error ?? 'Something went wrong. Try again.');
        return null;
      }
      return body.url as string;
    } finally {
      setBusy(null);
    }
  }

  async function onDownload() {
    const url = await post('download');
    if (!url) return;
    if (posthog.__loaded) posthog.capture('designs_download', { issue: slug });
    window.location.href = url;
  }

  async function onShare() {
    const url = await post('share');
    if (!url) return;
    if (posthog.__loaded) posthog.capture('designs_share', { issue: slug });
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: 'Free code for these app screens',
          url,
        });
        return;
      }
    } catch {
      // Cancelled share sheet: fall through to copying.
    }
    try {
      await navigator.clipboard.writeText(url);
      setNote(
        'Link copied. It is yours to pass on, and it has no personal token in it.'
      );
    } catch {
      setNote(url);
    }
  }

  if (state === 'subscriber') {
    return (
      <div className='bg-black/[0.03] p-7'>
        <p className='text-sm text-black'>
          Free, and you are already on the list.
        </p>
        <button
          type='button'
          onClick={onDownload}
          disabled={busy !== null}
          className='mt-5 w-full bg-gradient-primary py-4 text-sm uppercase tracking-widest text-white disabled:opacity-60'
        >
          {busy === 'download' ? 'Getting it' : `Download the code (${size})`}
        </button>
        <button
          type='button'
          onClick={onShare}
          disabled={busy !== null}
          className='mt-3 w-full border border-black/20 py-4 text-sm uppercase tracking-widest text-black transition-colors hover:border-black disabled:opacity-60'
        >
          {busy === 'share' ? 'Making a link' : 'Share with a friend'}
        </button>
        {note && <p className='mt-3 break-all text-sm text-black/70'>{note}</p>}
      </div>
    );
  }

  return (
    <div className='bg-black/[0.03] p-7'>
      {!formOpen ? (
        <>
          <p className='text-sm text-black'>
            Free. No payment, no catch, just your email.
          </p>
          <button
            type='button'
            onClick={() => setFormOpen(true)}
            className='mt-5 w-full bg-gradient-primary py-4 text-sm uppercase tracking-widest text-white'
          >
            Get the code
          </button>
        </>
      ) : (
        <NewsletterSignup
          source={`designs:${slug}`}
          refCode={refCode}
          layout='inline'
          headline='Get the code'
          blurb='Put your email in and the code comes straight to you. You also get the monthly email with the next set.'
          cta='Send me the code'
          successTitle='Check your inbox.'
          successBody='Confirm and the code is in the next email.'
          finePrint='Free. The only cost is signing up to my newsletter: one email a month, with a one-click unsubscribe in every one.'
          onSuccess={() => {
            if (posthog.__loaded)
              posthog.capture('designs_signup', {
                issue: slug,
                has_ref: Boolean(refCode),
              });
          }}
        />
      )}
    </div>
  );
}
