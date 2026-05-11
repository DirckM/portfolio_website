'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { Suspense, useEffect } from 'react';

function PostHogInit() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;
    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
      loaded: (ph) => {
        ph.register({ project: 'portfolio' });
      },
    });
  }, []);

  return null;
}

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthog.__loaded || !pathname) return;
    const url =
      window.origin +
      pathname +
      (searchParams.size ? `?${searchParams}` : '');
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogAnalytics() {
  return (
    <>
      <PostHogInit />
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
    </>
  );
}
