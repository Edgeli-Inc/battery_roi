# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

This repo is **spec-only** — no application code has been scaffolded yet. The single source of truth is `powerwall_roi_app_spec.md`. The first task is to build the app described there. Read that spec before writing code; this file summarizes the parts that are easy to get wrong.

## What this is

A client-side web app that estimates the financial ROI of a Tesla Powerwall 3 in CMP (Central Maine Power) / Versant territory. All math is client-side; **no backend**. Planned stack (from spec §3.1): Next.js 14+ App Router, TypeScript, Tailwind, Recharts, React `useState`/`useReducer` for state.

## Planned commands (once scaffolded with Next.js)

```bash
npm run dev      # local dev server
npm run build    # production build
npm run lint     # eslint
npm test         # run unit tests (calculations.ts is the priority target)
```

Build order per spec §9: `lib/types.ts` → `lib/constants.ts` → `lib/calculations.ts` → unit tests for the hybrid scenario → component tree (§3.2). Verify the calculation layer against the expected Year-1 numbers below **before** building UI.

## Deployment

Target is **GitHub Pages** (chosen by the owner). Since the app is fully client-side this works, but Next.js needs static-export config — get this right up front or assets 404:

- `next.config.js`: `output: 'export'`, `basePath: '/battery_roi'`, `assetPrefix: '/battery_roi/'` (repo serves from `user.github.io/battery_roi/`), and `images: { unoptimized: true }`.
- Add an empty `.nojekyll` file at the publish root so GitHub doesn't strip `_next/` directories.
- Build output is `out/`; publish that (e.g. via a GitHub Actions workflow on push to `main`).
- All links/asset paths must respect `basePath` — use Next's `<Link>`/`next/image`, not hardcoded `/foo` paths.

Alternative worth considering: **Vercel** (what spec §3.1 suggests) is zero-config for Next.js, serves from root (no `basePath`), and avoids the static-export gotchas. Use it if a third-party host is acceptable; otherwise GitHub Pages is fine.

## Architecture

The financial model is the heart of the app. All financial logic lives in `lib/calculations.ts` as **pure functions** — no React, no side effects. Components consume `calcRoi(params)`, which returns a 15-year `RoiSummary` (see `lib/types.ts` interfaces in spec §3.3). UI is a two-column layout with three scenario tabs: `VPP Only` | `TOU Only` | `Hybrid` (default to Hybrid).

### Three stacked revenue streams

1. **VPP payment** — Efficiency Maine (EMT) pays partners $200/kW-yr; Tesla passes through $160/kW-yr to the homeowner. **Contractually fixed for a 10-year term** (years 1–10 only; $0 in years 11–15). Independent of CMP rate changes.
2. **TOU arbitrage** — value = on-peak/off-peak rate spread × kWh the battery serves during the 5–9 PM weekday peak window.
3. **Hybrid** — stacks both: VPP cash on the ~40 event days + TOU spread on all weekday peak hours.

## Business logic rules that are easy to get wrong

These are the non-obvious invariants. Violating them produces plausible-but-wrong numbers.

- **Never subtract recharge cost as a separate line item.** The TOU spread (`onPeakAllIn − offPeakAllIn ≈ $0.4357/kWh`) already nets out the overnight recharge cost. Adding a recharge line double-counts it.
- **Effective discharge is capped at home load for TOU**, but **not** for VPP: `effDischarge = min(avgVppDischarge, homePeakLoad)` is used for arbitrage (can't serve more than the home draws), while VPP payment uses the **uncapped** `avgVppDischarge` (VPP can export beyond home load).
- **Degradation applies to both VPP and TOU** components each year: `cap_factor = (1 − degradation)^(N−1)`.
- **Rate escalation applies to TOU only**, never to VPP (VPP is fixed): `rate_factor = (1 + escalation)^(N−1)`. So `Annual(N) = VPP × vpp_active × cap_factor + TOU_yr1 × cap_factor × rate_factor`.
- **VPP-only scenario** keeps the homeowner on flat Rate A — there is no arbitrage spread, so TOU value is $0 and VPP payment is the only benefit. Model Rate A as flat (no escalation).
- **Scenario gating** in `calcYear1Breakdown`: `vpp` scenario zeroes all TOU components; `tou` scenario zeroes the VPP payment; `hybrid` includes all four components.

## Rate constants (CMP, effective Jan 1 2026)

All-in = delivery + standard-offer supply. On-peak $0.630354, off-peak $0.194662, Rate A (flat) $0.263684 /kWh. These are regulator-set (MPUC) and **must be re-verified whenever CMP files a new tariff** (spec §8 lists sources). Federal 30% ITC **expired Dec 31 2025 — do not include by default.**

## Expected Year-1 hybrid values at defaults (regression check)

Use these to validate `calculations.ts` (defaults: 3.6 kW discharge, $160/kW, 40 events, 250 weekdays, spread $0.4357):

- VPP payment: **$576** (3.6 × 160)
- TOU during VPP events: ~$188 (3.6 × 3hr × 40 × 0.4357)
- TOU residual hour: ~$63 (3.6 × 1hr × 40 × 0.4357)
- TOU non-event days: ~$1,310 (3.6 × 4hr × 210 × 0.4357)
- **Total Year 1: ~$2,137**, payback ≈ year 7–8.
