'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TerminalProps {
  commands?: string[];
  outputs?: Record<number, string[]>;
  username?: string;
  typingSpeed?: number;
  delayBetweenCommands?: number;
  initialDelay?: number;
  className?: string;
  title?: string;
}

type HistoryEntry =
  | { type: 'command'; text: string; partial: boolean }
  | { type: 'output'; lines: string[] };

export default function Terminal({
  commands = ['npm install', 'npm run build', 'npm run dev'],
  outputs = {
    0: ['added 312 packages in 4.2s'],
    1: [
      '> build',
      '> next build',
      '',
      'Route (app)           Size',
      '..compiled successfully',
    ],
    2: [
      '> dev',
      '> next dev',
      '',
      'ready - started server on http://localhost:3000',
    ],
  },
  username = 'user',
  typingSpeed = 50,
  delayBetweenCommands = 800,
  initialDelay = 500,
  className,
  title = 'terminal',
}: TerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [running, setRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (running) return;
    setRunning(true);
    setHistory([]);

    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>(resolve => setTimeout(resolve, ms));

    const run = async () => {
      await sleep(initialDelay);

      for (let cmdIdx = 0; cmdIdx < commands.length; cmdIdx++) {
        if (cancelled) break;
        const cmd = commands[cmdIdx];

        // Add partial command entry
        setHistory(prev => [
          ...prev,
          { type: 'command', text: '', partial: true },
        ]);

        // Type characters one by one
        for (let charIdx = 0; charIdx <= cmd.length; charIdx++) {
          if (cancelled) break;
          await sleep(typingSpeed);
          setHistory(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.type === 'command') {
              next[next.length - 1] = {
                type: 'command',
                text: cmd.slice(0, charIdx),
                partial: charIdx < cmd.length,
              };
            }
            return next;
          });
        }

        if (cancelled) break;
        await sleep(200);

        // Add output lines if any
        const outputLines = outputs[cmdIdx];
        if (outputLines && outputLines.length > 0) {
          setHistory(prev => [...prev, { type: 'output', lines: outputLines }]);
        }

        await sleep(delayBetweenCommands);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [commands, outputs, typingSpeed, delayBetweenCommands, initialDelay]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div
      className={cn(
        'w-full rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950 shadow-2xl font-mono text-sm',
        className
      )}
    >
      {/* Title bar */}
      <div className='flex items-center gap-2 px-4 py-3 bg-neutral-900 border-b border-neutral-700'>
        <span className='w-3 h-3 rounded-full bg-red-500' />
        <span className='w-3 h-3 rounded-full bg-yellow-500' />
        <span className='w-3 h-3 rounded-full bg-green-500' />
        <span className='ml-3 text-xs text-neutral-400 select-none'>
          {title}
        </span>
      </div>

      {/* Terminal body */}
      <div className='p-4 min-h-[200px] max-h-[400px] overflow-y-auto space-y-1'>
        {history.map((entry, i) => {
          if (entry.type === 'command') {
            return (
              <div key={i} className='flex items-start gap-2 text-green-400'>
                <span className='text-neutral-500 shrink-0'>
                  {username}@local:~$
                </span>
                <span>
                  {entry.text}
                  {entry.partial && (
                    <span className='animate-pulse ml-px border-r-2 border-green-400 h-4 inline-block' />
                  )}
                </span>
              </div>
            );
          }

          return (
            <div key={i} className='text-neutral-300 space-y-0.5'>
              {entry.lines.map((line, j) => (
                <div key={j} className='whitespace-pre-wrap'>
                  {line || '\u00A0'}
                </div>
              ))}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
