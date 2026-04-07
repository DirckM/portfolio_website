'use client';

import { useState, useCallback } from 'react';

export interface ControlConfig {
  prop: string;
  label?: string;
  type: 'color' | 'slider' | 'select' | 'toggle';
  default: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

interface PropControlsProps {
  controls: ControlConfig[];
  values: Record<string, string | number | boolean>;
  onChange: (prop: string, value: string | number | boolean) => void;
}

export default function PropControls({
  controls,
  values,
  onChange,
}: PropControlsProps) {
  return (
    <div className='flex flex-wrap gap-4 px-4 py-3 bg-[#1e1e1e] border-t border-white/10 rounded-b-lg'>
      {controls.map(ctrl => (
        <div key={ctrl.prop} className='flex items-center gap-2'>
          <label className='text-xs text-white/50 font-[family-name:var(--font-jetbrains-mono)]'>
            {ctrl.label || ctrl.prop}
          </label>
          {ctrl.type === 'color' && (
            <input
              type='color'
              value={values[ctrl.prop] as string}
              onChange={e => onChange(ctrl.prop, e.target.value)}
              className='w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer'
            />
          )}
          {ctrl.type === 'slider' && (
            <div className='flex items-center gap-2'>
              <input
                type='range'
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                value={values[ctrl.prop] as number}
                onChange={e => onChange(ctrl.prop, parseFloat(e.target.value))}
                className='w-24 accent-[#5227FF]'
              />
              <span className='text-xs text-white/40 font-[family-name:var(--font-jetbrains-mono)] w-10'>
                {values[ctrl.prop]}
              </span>
            </div>
          )}
          {ctrl.type === 'select' && (
            <select
              value={values[ctrl.prop] as string}
              onChange={e => onChange(ctrl.prop, e.target.value)}
              className='text-xs bg-[#2d2d2d] text-white/80 border border-white/20 rounded px-2 py-1 font-[family-name:var(--font-jetbrains-mono)]'
            >
              {ctrl.options?.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
          {ctrl.type === 'toggle' && (
            <button
              onClick={() => onChange(ctrl.prop, !values[ctrl.prop])}
              className={`w-9 h-5 rounded-full transition-colors ${
                values[ctrl.prop] ? 'bg-[#5227FF]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  values[ctrl.prop] ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
