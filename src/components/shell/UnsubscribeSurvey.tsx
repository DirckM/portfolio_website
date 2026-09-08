'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';

/**
 * Asks why, after the fact.
 *
 * The unsubscribe is already committed before this renders. Nothing here can
 * gate it, delay it or reverse it, which is what keeps leaving a single click
 * and keeps the RFC 8058 machine path clean.
 *
 * Every field is optional and there is exactly one screen. At this list size a
 * handful of sentences is worth more than a pile of categories, so the open
 * field is not an afterthought under the buttons, it is the point of the page.
 */

const REASONS = [
  { value: 'too_many', label: 'Too many emails' },
  { value: 'not_relevant', label: 'Not relevant to me' },
  { value: 'got_what_i_came_for', label: 'I got what I came for' },
  { value: 'dont_remember', label: 'I do not remember signing up' },
] as const;

export default function UnsubscribeSurvey({ token }: { token: string }) {
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (withReason: string | null) => {
    if (sending) return;
    setSending(true);
    try {
      await fetch('/api/newsletter/unsubscribe-reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, reason: withReason, note: note.trim() || null }),
      });
    } catch {
      // Silent. They have already unsubscribed successfully and an error here
      // would imply otherwise.
    }
    setSent(true);
    setSending(false);
  };

  if (sent) {
    return (
      <p className='mt-10 text-sm text-black/60'>
        Thank you, that is genuinely useful.
      </p>
    );
  }

  return (
    <div className='mt-12 pt-8 border-t border-black/10'>
      <p className='text-sm text-black'>If you have ten seconds, what made you leave?</p>

      <div className='mt-4 flex flex-wrap gap-2'>
        {REASONS.map(r => (
          <button
            key={r.value}
            type='button'
            onClick={() => {
              setReason(r.value);
              // A tap is the whole answer for most people. Send immediately
              // rather than making them find a second button.
              if (!note.trim()) void submit(r.value);
            }}
            className={`px-4 py-2 text-sm border rounded-full transition-colors ${
              reason === r.value
                ? 'border-black bg-black text-white'
                : 'border-black/20 text-black/70 hover:border-black/50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <label htmlFor='unsub-note' className='mt-8 block text-sm text-black/60'>
        Anything I should know?
      </label>
      <textarea
        id='unsub-note'
        rows={3}
        value={note}
        onChange={e => setNote(e.target.value)}
        className='mt-2 w-full bg-transparent border-b border-black/20 py-2 text-sm text-black outline-none focus:border-black transition-colors resize-none'
      />

      <motion.button
        type='button'
        onClick={() => void submit(reason)}
        disabled={sending || (!reason && !note.trim())}
        whileHover={{ scale: sending ? 1 : 1.01 }}
        whileTap={{ scale: sending ? 1 : 0.99 }}
        className='mt-6 bg-gradient-primary text-white px-8 py-3 text-sm uppercase tracking-widest disabled:opacity-40'
      >
        {sending ? 'Sending' : 'Send'}
      </motion.button>
    </div>
  );
}
