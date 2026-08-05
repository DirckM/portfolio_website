'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import PropControls, { type ControlConfig } from './PropControls';

interface LiveStepProps {
  code: string;
  scope?: Record<string, any>;
  controls?: ControlConfig[];
  previewClassName?: string;
  previewBg?: string;
  /**
   * Turns the preview pane into its own scroll container with room above and
   * below the demo. Required for anything driven by `animation-timeline:
   * view()` or `scroll()`, which needs a scrollport of its own. Without it the
   * timeline resolves against the article and the demo animates on the reader's
   * page scroll instead of its own.
   */
  previewScroll?: boolean;
}

function updateCodeWithValues(
  code: string,
  values: Record<string, string | number | boolean>
): string {
  let updated = code;
  for (const [prop, value] of Object.entries(values)) {
    if (typeof value === 'string') {
      const regex = new RegExp(`${prop}=\\{?["'][^"']*["']\\}?`, 'g');
      updated = updated.replace(regex, `${prop}="${value}"`);
      const regex2 = new RegExp(`${prop}="[^"]*"`, 'g');
      updated = updated.replace(regex2, `${prop}="${value}"`);
    } else if (typeof value === 'number') {
      const regex = new RegExp(`${prop}=\\{[^}]*\\}`, 'g');
      updated = updated.replace(regex, `${prop}={${value}}`);
    } else if (typeof value === 'boolean') {
      const regex = new RegExp(`${prop}=\\{[^}]*\\}`, 'g');
      updated = updated.replace(regex, `${prop}={${value}}`);
    }
  }
  return updated;
}

export default function LiveStep({
  code: initialCode,
  scope = {},
  controls = [],
  previewClassName = '',
  previewBg = 'bg-library-cream',
  previewScroll = false,
}: LiveStepProps) {
  const defaultValues = useMemo(() => {
    const vals: Record<string, string | number | boolean> = {};
    controls.forEach(c => {
      vals[c.prop] = c.default;
    });
    return vals;
  }, [controls]);

  const [mounted, setMounted] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [controlValues, setControlValues] = useState(defaultValues);
  const [code, setCode] = useState((initialCode || '').trim());

  useEffect(() => setMounted(true), []);

  const handleControlChange = useCallback(
    (prop: string, value: string | number | boolean) => {
      setControlValues(prev => {
        const next = { ...prev, [prop]: value };
        setCode(prevCode => updateCodeWithValues(prevCode, { [prop]: value }));
        return next;
      });
    },
    []
  );

  return (
    <div
      className='my-8 rounded-lg overflow-hidden border border-white/10'
      suppressHydrationWarning
    >
      {!mounted ? (
        <div className='h-[300px] bg-[#282c34] animate-pulse' />
      ) : (
        <LiveProvider code={code} scope={scope} noInline={false}>
          <div className='grid grid-cols-1 lg:grid-cols-2'>
            <div className='bg-[#282c34] overflow-auto max-h-[400px]'>
              <div className='px-4 py-2 border-b border-white/10'>
                <span className='text-xs text-white/40 font-[family-name:var(--font-jetbrains-mono)]'>
                  Editable
                </span>
              </div>
              <LiveEditor
                className='!font-[family-name:var(--font-jetbrains-mono)] !text-sm !leading-relaxed'
                style={{
                  fontFamily: 'var(--font-jetbrains-mono)',
                  fontSize: '0.875rem',
                  lineHeight: '1.625',
                  background: 'transparent',
                }}
                onChange={setCode}
              />
            </div>
            <div
              className={
                previewScroll
                  ? `${previewBg} relative ${previewClassName}`
                  : `${previewBg} min-h-[200px] flex items-center justify-center p-6 relative ${previewClassName}`
              }
            >
              {previewScroll ? (
                <div
                  key={replayKey}
                  className='h-[420px] overflow-y-auto px-6'
                  // Space above and below so the demo enters and leaves this
                  // scrollport, which is what a view() timeline animates on.
                >
                  <div aria-hidden className='h-[320px]' />
                  {/* Same data-live-preview hook as the branch below, so
                      scripts/check-post.mjs can see scroll-driven demos too.
                      It goes on the wrapper around <LivePreview /> and not on
                      the scrollport, whose spacer divs would make the empty-box
                      check pass no matter what rendered. */}
                  <div
                    data-live-preview
                    className='w-full flex items-center justify-center'
                  >
                    <LivePreview />
                  </div>
                  <div aria-hidden className='h-[320px]' />
                </div>
              ) : (
                <div
                  key={replayKey}
                  data-live-preview
                  className='w-full flex items-center justify-center'
                >
                  <LivePreview />
                </div>
              )}
              <button
                onClick={() => setReplayKey(k => k + 1)}
                className='absolute top-3 right-3 text-xs px-3 py-1.5 rounded-md bg-black/10 hover:bg-black/20 text-black/50 hover:text-black/80 transition-colors'
              >
                Replay
              </button>
            </div>
          </div>
          {/* data-live-error is what scripts/check-post.mjs looks for. react-live
              renders nothing here when the code compiles, so a non-empty slot
              means the demo is broken. */}
          <div data-live-error>
            <LiveError className='bg-red-900/50 text-red-200 text-xs p-3 font-[family-name:var(--font-jetbrains-mono)]' />
          </div>
          {controls.length > 0 && (
            <PropControls
              controls={controls}
              values={controlValues}
              onChange={handleControlChange}
            />
          )}
        </LiveProvider>
      )}
    </div>
  );
}
