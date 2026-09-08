'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import posthog from 'posthog-js';

/**
 * Newsletter signup.
 *
 * Follows the conventions of ContactForm.tsx, which is the only established
 * form pattern in this repo: floating label, underlined input with no box,
 * gradient submit, and status reported as inline text rather than a toast.
 * There is no toast system here and this is not the place to introduce one.
 *
 * Styling note that matters: `text-library-gray`, `border-library-border` and
 * friends are defined in tailwind.config.ts, which Tailwind v4 never loads
 * because globals.css has no @config directive. Those classes compile to
 * nothing today. So this component uses opacity utilities, which work
 * everywhere including the portfolio route group that sits outside the
 * .library-theme wrapper.
 */

interface Props {
  /** Where this instance lives, recorded against the subscriber. */
  source: string;
  layout?: 'inline' | 'panel';
  headline?: string;
  blurb?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterSignup({
  source,
  layout = 'inline',
  headline = 'What I am building',
  blurb = 'One email a month. New components, what shipped, what broke.',
}: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [focused, setFocused] = useState(false);

  // Honeypot plus a time-to-submit floor. Both are filled by bots and neither
  // is visible to a person. Cheaper and less annoying than a captcha.
  const [website, setWebsite] = useState('');
  const mountedAt = useRef(Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();

    if (!value) return setError('Email is required');
    if (!EMAIL_RE.test(value)) return setError('That does not look like an email');

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: value,
          source,
          consent: true,
          website,
          elapsed: Date.now() - mountedAt.current,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: null }));
        setStatus('error');
        setError(body.error ?? 'Something went wrong. Try again.');
        return;
      }

      setStatus('success');
      setEmail('');
      if (posthog.__loaded) posthog.capture('newsletter_signup', { source });
    } catch {
      setStatus('error');
      setError('Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <div className={layout === 'panel' ? 'py-8' : 'py-2'}>
        <p className='text-sm text-black'>Check your inbox.</p>
        <p className='mt-1 text-sm text-black/60'>
          I sent a confirmation link. One click and you are on the list.
        </p>
      </div>
    );
  }

  const isPanel = layout === 'panel';

  return (
    <div className={isPanel ? 'bg-black/[0.03] p-8' : ''}>
      {isPanel && (
        <>
          <h2 className='text-2xl font-[family-name:var(--font-instrument-serif)] text-black'>
            {headline}
          </h2>
          <p className='mt-2 mb-6 text-sm text-black/60'>{blurb}</p>
        </>
      )}
      {!isPanel && (
        <p className='mb-4 text-sm text-black/60'>
          <span className='text-black'>{headline}.</span> {blurb}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Not display:none. Some bots skip hidden fields but fill offscreen ones. */}
        <div
          aria-hidden='true'
          className='absolute left-[-9999px] h-0 w-0 overflow-hidden'
        >
          <label htmlFor={`website-${source}`}>Leave this empty</label>
          <input
            id={`website-${source}`}
            type='text'
            tabIndex={-1}
            autoComplete='off'
            value={website}
            onChange={e => setWebsite(e.target.value)}
          />
        </div>

        <div className='relative'>
          <label
            htmlFor={`email-${source}`}
            className={`absolute left-0 transition-all duration-200 pointer-events-none ${
              focused || email
                ? 'text-[10px] -top-4 uppercase tracking-widest text-black/50'
                : 'top-2 text-sm text-black/40'
            }`}
          >
            Your email
          </label>
          <input
            id={`email-${source}`}
            type='email'
            inputMode='email'
            autoComplete='email'
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className='w-full bg-transparent border-b border-black/20 py-2 text-sm text-black outline-none focus:border-black transition-colors'
          />
        </div>

        <motion.button
          type='submit'
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
          className='mt-6 w-full bg-gradient-primary text-white py-4 text-sm uppercase tracking-widest disabled:opacity-60'
        >
          {isSubmitting ? 'Signing up' : 'Sign up'}
        </motion.button>

        <p className='mt-3 text-[11px] leading-relaxed text-black/50'>
          One email a month, and a one-click unsubscribe in every one. See the{' '}
          <a href='/privacy' className='underline underline-offset-2'>
            privacy policy
          </a>
          .
        </p>

        {error && <p className='mt-3 text-sm text-black'>{error}</p>}
      </form>
    </div>
  );
}
