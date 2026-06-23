'use client';

import { useState } from 'react';

interface InfoTipProps {
  /** Accessible label, e.g. the name of the field the tip describes. */
  label: string;
  /** Description text shown on hover/focus. */
  text: string;
}

/** Small "i" info icon that reveals a description on hover or keyboard focus. */
export default function InfoTip({ label, text }: InfoTipProps) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={`About ${label}`}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 font-serif text-[11px] font-bold italic leading-none text-slate-600 hover:bg-slate-300"
      >
        i
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 z-10 mb-1 w-56 -translate-x-1/2 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-normal not-italic leading-snug text-white shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}
