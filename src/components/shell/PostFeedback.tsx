'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import posthog from 'posthog-js';
import { assignVariant, getVisitorId, type ExperimentKey } from '@/lib/experiments';
import NewsletterSignup from './NewsletterSignup';

/**
 * "Did this post land?" — two arms, measured.
 *
 * Both arms cost exactly one tap, so the test isolates WHAT is asked rather
 * than how hard it is to answer.
 *
 *   quick-verdict  Yes / Not really. A verdict.
 *   reaction-row   Three chips naming a plausible reason. A category.
 *
 * The hypothesis is that naming a non-negative reason lowers the social cost
 * of admitting a post did not land, so B gets both a higher submit rate and a
 * much higher comment rate. The "I got stuck somewhere" bucket is also
 * directly actionable per component in a way a thumbs-down is not.
 *
 * Renders null until the effect has run. That avoids a hydration mismatch
 * entirely, and is invisible because this sits below the fold.
 */

const KEY: ExperimentKey = 'post-feedback-v1';

const VERDICTS = [
  { value: 'yes', rating: 1, label: 'Yes' },
  { value: 'not-really', rating: -1, label: 'Not really' },
] as const;

const REACTIONS = [
  { value: 'will-use', label: 'I am going to use this', follow: 'What are you building with it?' },
  { value: 'not-for-me', label: 'Interesting, not for me', follow: 'What were you looking for instead?' },
  { value: 'got-stuck', label: 'I got stuck somewhere', follow: 'Where did you get stuck?' },
] as const;

interface Props {
  slug: string;
  category: string;
}

export default function PostFeedback({ slug, category }: Props) {
  const [variant, setVariant] = useState<string | null>(null);
  const [answered, setAnswered] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState('');
  const [done, setDone] = useState(false);
  const visitorId = useRef<string>('');
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    visitorId.current = getVisitorId();
    const v = assignVariant(KEY, visitorId.current);
    setVariant(v);
    if (posthog.__loaded) {
      posthog.register({ feedback_variant: v, experiment: KEY });
    }
  }, []);

  /**
   * Exposure fires once per visitor per post, when the widget is actually
   * half on screen. Counting a render as an exposure would inflate the
   * denominator with people who never scrolled this far, which is the easiest
   * way to make an experiment quietly lie.
   */
  useEffect(() => {
    if (!variant || !wrap.current) return;
    const seenKey = `dm_exp_${KEY}_${slug}`;
    try {
      if (sessionStorage.getItem(seenKey)) return;
    } catch {
      /* private window, count it and move on */
    }
    const io = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting) return;
        try {
          sessionStorage.setItem(seenKey, '1');
        } catch {
          /* ignore */
        }
        // sendBeacon survives the page being closed mid-flight.
        const body = JSON.stringify({ post_slug: slug, experiment_key: KEY, variant });
        try {
          navigator.sendBeacon('/api/feedback/view', new Blob([body], { type: 'application/json' }));
        } catch {
          void fetch('/api/feedback/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
          }).catch(() => {});
        }
        if (posthog.__loaded) posthog.capture('post_widget_shown', { slug, category, variant });
        io.disconnect();
      },
      { threshold: 0.5 }
    );
    io.observe(wrap.current);
    return () => io.disconnect();
  }, [variant, slug, category]);

  const submit = async (choice: string, rating: number | null, comment: string) => {
    setAnswered(choice);
    if (posthog.__loaded) {
      posthog.capture('post_feedback_given', { slug, variant, choice, has_comment: !!comment });
    }
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_slug: slug,
          experiment_key: KEY,
          variant,
          visitor_id: visitorId.current,
          rating,
          choice,
          comment: comment || null,
          path: typeof window !== 'undefined' ? window.location.pathname : null,
        }),
      });
    } catch {
      // Their answer is recorded in PostHog either way, and an error here
      // would punish someone for doing us a favour.
    }
  };

  if (!variant) return <div ref={wrap} />;

  const chosen = REACTIONS.find(r => r.value === answered);
  const followLabel =
    variant === 'reaction-row' && chosen
      ? chosen.follow
      : 'Anything I would fix if I rewrote it?';

  return (
    <div ref={wrap} className='mt-12 pt-8 border-t border-black/10'>
      {!answered ? (
        <>
          <p className='text-sm text-black'>
            {variant === 'quick-verdict' ? 'Did this post work for you?' : 'Where did you land?'}
          </p>
          <div className='mt-4 flex flex-wrap gap-2'>
            {variant === 'quick-verdict'
              ? VERDICTS.map(v => (
                  <button
                    key={v.value}
                    type='button'
                    onClick={() => void submit(v.value, v.rating, '')}
                    className='px-5 py-2 text-sm border border-black/20 rounded-full text-black/70 hover:border-black hover:text-black transition-colors'
                  >
                    {v.label}
                  </button>
                ))
              : REACTIONS.map(r => (
                  <button
                    key={r.value}
                    type='button'
                    onClick={() => void submit(r.value, null, '')}
                    className='px-4 py-2 text-sm border border-black/20 rounded-full text-black/70 hover:border-black hover:text-black transition-colors'
                  >
                    {r.label}
                  </button>
                ))}
          </div>
        </>
      ) : !done ? (
        <>
          <p className='text-sm text-black'>Thank you.</p>
          <label htmlFor={`fb-${slug}`} className='mt-5 block text-sm text-black/60'>
            {followLabel}
          </label>
          <textarea
            id={`fb-${slug}`}
            rows={2}
            value={followUp}
            onChange={e => setFollowUp(e.target.value)}
            className='mt-2 w-full bg-transparent border-b border-black/20 py-2 text-sm text-black outline-none focus:border-black transition-colors resize-none'
          />
          <motion.button
            type='button'
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              if (followUp.trim()) void submit(answered, null, followUp.trim());
              setDone(true);
            }}
            className='mt-4 text-sm text-black underline underline-offset-4 hover:no-underline'
          >
            {followUp.trim() ? 'Send' : 'Skip'}
          </motion.button>
        </>
      ) : (
        <p className='text-sm text-black/60'>Noted, thank you.</p>
      )}

      <div className='mt-10 pt-8 border-t border-black/10'>
        <NewsletterSignup source={`post:${slug}`} />
      </div>
    </div>
  );
}
