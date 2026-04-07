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
}: LiveStepProps) {
  const defaultValues = useMemo(() => {
    const vals: Record<string, string | number | boolean> = {};
    controls.forEach(c => {
      vals[c.prop] = c.default;
    });
    return vals;
  }, [controls]);

  const [mounted, setMounted] = useState(false);
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

  if (!mounted) {
    return <div className='my-8 h-[300px] rounded-lg bg-[#282c34] animate-pulse' />;
  }

  return (
    <div className='my-8 rounded-lg overflow-hidden border border-white/10'>
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
            className={`${previewBg} min-h-[200px] flex items-center justify-center p-6 ${previewClassName}`}
          >
            <LivePreview />
          </div>
        </div>
        <LiveError className='bg-red-900/50 text-red-200 text-xs p-3 font-[family-name:var(--font-jetbrains-mono)]' />
        {controls.length > 0 && (
          <PropControls
            controls={controls}
            values={controlValues}
            onChange={handleControlChange}
          />
        )}
      </LiveProvider>
    </div>
  );
}
