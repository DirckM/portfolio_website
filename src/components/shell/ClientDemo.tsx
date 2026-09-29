'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';

/**
 * Renders a lazily imported demo in the browser only. The demos are
 * React.lazy imports, and several touch window or WebGL while rendering, so
 * they wait for mount instead of running on the server.
 */
export default function ClientDemo({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
