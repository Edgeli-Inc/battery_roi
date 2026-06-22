export default function RateRiskCallout() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Rate risk</p>
      <p className="mt-1 leading-relaxed">
        CMP TOU rates are set by the MPUC and can change at any time. The current
        on-peak/off-peak delivery spread of ~7.5:1 is well above the 3–4:1 range
        regulators typically consider sustainable for broad residential adoption,
        and MPUC docket 2024-00231 is actively reviewing TOU rate design. The VPP
        payment ($160/kW from Tesla) is contractually fixed for the 10-year program
        term and is <span className="font-semibold">not</span> subject to rate-case
        changes.
      </p>
    </div>
  );
}
