const ITEMS = [
  'CMP TOU rates effective January 1, 2026. Rates subject to change by the MPUC.',
  'Federal 30% ITC (Residential Clean Energy Credit) expired December 31, 2025 and is not reflected in this model.',
  'EMT VPP program rate fixed at $200/kW for 10-year program partner agreements; Tesla pass-through rate $160/kW per published terms as of June 2026.',
  'Model assumes a single Powerwall 3 unit. Installed-cost estimates reflect the New England market.',
  'This tool is for estimation purposes only and does not constitute financial advice.',
];

export default function Disclaimers() {
  return (
    <footer className="mt-8 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-400">
      <ul className="list-disc space-y-1 pl-4">
        {ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </footer>
  );
}
