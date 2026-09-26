'use client';

import React, { useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CircleAlert, MailCheck } from 'lucide-react';
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
  /**
   * 'underline' is the site's form (ContactForm's floating label). 'pill' is
   * one rounded field with the button inside it, stacked on a phone, for a
   * page where the form is the whole point (/designs). Same behaviour.
   */
  variant?: 'underline' | 'pill';
  headline?: string;
  blurb?: string;
  /** Fired once the signup succeeded, so a host (the modal) can react. */
  onSuccess?: () => void;
  /** Label on the submit button. */
  cta?: string;
  /** Replaces the success copy, e.g. a giveaway that arrives after confirming. */
  successTitle?: string;
  successBody?: string;
  /**
   * Replaces the line under the button. A giveaway form MUST say here that the
   * signup also puts them on the newsletter, because that is what CONSENT_TEXT
   * records they agreed to.
   */
  finePrint?: React.ReactNode;
  /** A share link id from a shared link, passed through to the signup. */
  refCode?: string | null;
  /**
   * Record the submit press as a button event (the /designs page and the blog
   * kit panel). Only the press, never the address.
   */
  track?: { page: 'designs' | 'blog-kit'; slug?: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterSignup({
  source,
  layout = 'inline',
  variant = 'underline',
  headline = 'What I am building',
  blurb = 'One email a month. New components, what shipped, what broke.',
  onSuccess,
  cta = 'Sign up',
  successTitle = 'Check your inbox.',
  successBody = 'I sent a confirmation link. One click and you are on the list.',
  finePrint = 'One email a month, and a one-click unsubscribe in every one.',
  refCode = null,
  track,
}: Props) {
  // Two forms with the same source can sit on one page, and the source used to
  // be the id, which made the labels point at the wrong input.
  const uid = useId();
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
    if (track) {
      fetch('/api/designs/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: track.page, slug: track.slug ?? '', kind: 'form_submit' }),
        keepalive: true,
      }).catch(() => {});
    }

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
          ...(refCode ? { ref: refCode } : {}),
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
      onSuccess?.();
      if (posthog.__loaded) posthog.capture('newsletter_signup', { source });
    } catch {
      setStatus('error');
      setError('Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'pill') {
    return (
      <PillForm
        uid={uid}
        email={email}
        setEmail={setEmail}
        error={error}
        setError={setError}
        website={website}
        setWebsite={setWebsite}
        isSubmitting={isSubmitting}
        success={status === 'success'}
        onSubmit={handleSubmit}
        cta={cta}
        successTitle={successTitle}
        successBody={successBody}
        finePrint={finePrint}
      />
    );
  }

  if (status === 'success') {
    return (
      <div className={layout === 'panel' ? 'py-8' : 'py-2'}>
        <p className='text-sm text-black'>{successTitle}</p>
        <p className='mt-1 text-sm text-black/60'>{successBody}</p>
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
      {!isPanel && (headline || blurb) && (
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
          <label htmlFor={`website-${uid}`}>Leave this empty</label>
          <input
            id={`website-${uid}`}
            type='text'
            tabIndex={-1}
            autoComplete='off'
            value={website}
            onChange={e => setWebsite(e.target.value)}
          />
        </div>

        <div className='relative'>
          <label
            htmlFor={`email-${uid}`}
            className={`absolute left-0 transition-all duration-200 pointer-events-none ${
              focused || email
                ? 'text-[10px] -top-4 uppercase tracking-widest text-black/50'
                : 'top-2 text-sm text-black/40'
            }`}
          >
            Your email
          </label>
          <input
            id={`email-${uid}`}
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
          {isSubmitting ? 'Signing up' : cta}
        </motion.button>

        <p className='mt-3 text-[11px] leading-relaxed text-black/50'>
          {finePrint} See the{' '}
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

function PillForm({
  uid,
  email,
  setEmail,
  error,
  setError,
  website,
  setWebsite,
  isSubmitting,
  success,
  onSubmit,
  cta,
  successTitle,
  successBody,
  finePrint,
}: {
  uid: string;
  email: string;
  setEmail: (v: string) => void;
  error: string | null;
  setError: (v: string | null) => void;
  website: string;
  setWebsite: (v: string) => void;
  isSubmitting: boolean;
  success: boolean;
  onSubmit: (e: React.FormEvent) => void;
  cta: string;
  successTitle: string;
  successBody: string;
  finePrint: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const fade = reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
      };
  const errorId = `email-error-${uid}`;

  return (
    <div className='w-full'>
      <AnimatePresence mode='wait' initial={false}>
        {success ? (
          <motion.div
            key='done'
            {...fade}
            role='status'
            className='flex items-center gap-4 rounded-[28px] border border-black/10 bg-white p-4 pr-6 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.18)]'
          >
            <span className='bg-gradient-primary flex size-12 shrink-0 items-center justify-center rounded-full text-white'>
              <MailCheck className='size-5' strokeWidth={1.75} aria-hidden />
            </span>
            <span>
              <span className='block text-[15px] font-medium text-black'>
                {successTitle}
              </span>
              <span className='mt-0.5 block text-sm text-black/60'>
                {successBody}
              </span>
            </span>
          </motion.div>
        ) : (
          <motion.form key='form' {...fade} onSubmit={onSubmit} noValidate>
            {/* Not display:none. Some bots skip hidden fields but fill offscreen ones. */}
            <div
              aria-hidden='true'
              className='absolute left-[-9999px] h-0 w-0 overflow-hidden'
            >
              <label htmlFor={`website-${uid}`}>Leave this empty</label>
              <input
                id={`website-${uid}`}
                type='text'
                tabIndex={-1}
                autoComplete='off'
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </div>

            <div
              className={`flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:border sm:bg-white sm:p-1.5 sm:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.18)] sm:transition-[border-color,box-shadow] sm:duration-200 ${
                error
                  ? 'sm:border-[#e66a1a] sm:shadow-[0_0_0_4px_rgba(255,126,53,0.16)]'
                  : 'sm:border-black/10 sm:focus-within:border-[#ff7e35] sm:focus-within:shadow-[0_0_0_4px_rgba(255,126,53,0.18),0_12px_32px_-12px_rgba(0,0,0,0.18)]'
              }`}
            >
              <label htmlFor={`email-${uid}`} className='sr-only'>
                Your email
              </label>
              <input
                id={`email-${uid}`}
                type='email'
                inputMode='email'
                autoComplete='email'
                placeholder='you@example.com'
                value={email}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                onChange={e => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className={`h-14 w-full min-w-0 rounded-full bg-white px-6 text-base text-black outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-black/35 max-sm:border sm:h-12 sm:flex-1 sm:bg-transparent sm:pl-5 sm:pr-3 sm:text-[15px] ${
                  error
                    ? 'max-sm:border-[#e66a1a] max-sm:shadow-[0_0_0_4px_rgba(255,126,53,0.16)]'
                    : 'max-sm:border-black/10 max-sm:shadow-[0_1px_2px_rgba(0,0,0,0.04)] max-sm:focus:border-[#ff7e35] max-sm:focus:shadow-[0_0_0_4px_rgba(255,126,53,0.18)]'
                }`}
              />
              <motion.button
                type='submit'
                disabled={isSubmitting}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className='bg-gradient-primary group inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-medium text-white transition-opacity disabled:opacity-60 sm:h-12'
              >
                {isSubmitting ? 'Sending' : cta}
                <ArrowRight
                  className='size-4 transition-transform duration-200 group-hover:translate-x-0.5'
                  strokeWidth={2}
                  aria-hidden
                />
              </motion.button>
            </div>

            <div aria-live='polite' className='min-h-0'>
              <AnimatePresence initial={false}>
                {error && (
                  <motion.p
                    id={errorId}
                    key='err'
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className='overflow-hidden text-sm text-black'
                  >
                    <span className='flex items-center gap-1.5 px-5 pt-3'>
                      <CircleAlert
                        className='size-4 shrink-0 text-[#e66a1a]'
                        strokeWidth={2}
                        aria-hidden
                      />
                      {error}
                    </span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <p className='mt-4 px-5 text-[12px] leading-relaxed text-black/50'>
        {finePrint} See the{' '}
        <a
          href='/privacy'
          className='underline underline-offset-2 transition-colors hover:text-black'
        >
          privacy policy
        </a>
        .
      </p>
    </div>
  );
}
