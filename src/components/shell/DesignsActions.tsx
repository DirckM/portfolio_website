'use client';

import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import NewsletterSignup from './NewsletterSignup';

/**
 * The buttons on /designs/<slug>.
 *
 * A subscriber (valid token or cookie) downloads directly and can share a
 * public link. Anyone else gets the newsletter form, and the zip arrives in
 * the welcome email.
 *
 * Every press is recorded from here, by POST, after the click: the page's GET
 * is also opened by mail scanners and link previewers and must count nothing.
 * Each share makes its own link id, so each link can be followed on its own.
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

function newShareId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('');
}

function post(path: string, body: object) {
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  });
}

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

  const track = (kind: string, shareId?: string) =>
    post('/api/designs/event', { page: 'designs', slug, kind, shareId }).catch(
      () => {}
    );

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('t');
    if (token) {
      // The email click. Keep the access in an HttpOnly cookie, then take the
      // personal token out of the address bar so it cannot be copied on.
      post('/api/designs/session', { slug, token })
        .catch(() => {})
        .finally(() => {
          url.searchParams.delete('t');
          window.history.replaceState(
            null,
            '',
            url.pathname + url.search + url.hash
          );
        });
    } else if (refCode) {
      post('/api/designs/visit', { ref: refCode }).catch(() => {});
    }
    if (posthog.__loaded) {
      posthog.capture('designs_page_view', {
        issue: slug,
        has_token: hasTokenInUrl || state === 'subscriber',
        has_ref: Boolean(refCode),
      });
    }
  }, [slug, state, refCode, hasTokenInUrl]);

  async function onDownload() {
    setBusy('download');
    setNote(null);
    try {
      const res = await post('/api/designs/download', { slug });
      const body = await res.json().catch(() => ({}));
      if (!res.ok)
        return setNote(body.error ?? 'Something went wrong. Try again.');
      if (posthog.__loaded)
        posthog.capture('designs_download', { issue: slug });
      window.location.href = body.url;
    } finally {
      setBusy(null);
    }
  }

  async function onShare() {
    setNote(null);
    // The id is made here so the share sheet opens inside the click itself.
    // Safari only allows navigator.share during the user's gesture, and a
    // network round trip first can use that up.
    const id = newShareId();
    const url = `${window.location.origin}/designs/${slug}?ref=${id}`;
    const native = typeof navigator.share === 'function';
    const registered = post('/api/designs/share', {
      slug,
      id,
      method: native ? 'native' : 'copy',
    }).catch(() => null);
    if (posthog.__loaded)
      posthog.capture('designs_share', {
        issue: slug,
        method: native ? 'native' : 'copy',
      });

    if (native) {
      track('native_opened', id);
      try {
        await navigator.share({
          title,
          text: 'Free code for these app screens',
          url,
        });
        await registered;
        track('native_completed', id);
        return;
      } catch (err) {
        await registered;
        if (err instanceof DOMException && err.name === 'AbortError') {
          track('native_cancelled', id);
          return;
        }
        // Any other failure: fall back to copying the same link.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      await registered;
      track('copy_success', id);
      setNote(
        'Link copied. It is yours to pass on, and it has no personal token in it.'
      );
    } catch {
      await registered;
      track('copy_failed', id);
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
          Share with a friend
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
            onClick={() => {
              setFormOpen(true);
              track('form_open');
            }}
            className='mt-5 w-full bg-gradient-primary py-4 text-sm uppercase tracking-widest text-white'
          >
            Get the code
          </button>
        </>
      ) : (
        <NewsletterSignup
          source={`designs:${slug}`}
          refCode={refCode}
          track={{ page: 'designs', slug }}
          layout='inline'
          headline='Get the code'
          blurb='Put your email in and the code comes straight to you. You also get the monthly email with the next set.'
          cta='Send me the code'
          successTitle='Check your inbox.'
          successBody='Confirm and the code is in the next email.'
          finePrint='Free. The only cost is signing up to my newsletter: one email a month, with a one-click unsubscribe in every one.'
          onSuccess={() => {
            if (posthog.__loaded) {
              posthog.capture('designs_signup', {
                issue: slug,
                has_ref: Boolean(refCode),
              });
            }
          }}
        />
      )}
    </div>
  );
}
