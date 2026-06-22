'use client';

import { useState } from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  /** When set, the section is collapsible and starts collapsed. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  action?: React.ReactNode;
}

export default function Section({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
  action,
}: SectionProps) {
  const [open, setOpen] = useState(collapsible ? defaultOpen : true);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500"
          >
            <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
            {title}
          </button>
        ) : (
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </h2>
        )}
        {action}
      </div>
      {open && <div className="mt-1 divide-y divide-slate-100">{children}</div>}
    </section>
  );
}
