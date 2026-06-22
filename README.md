# Powerwall ROI Estimator

A client-side web app that estimates the 15-year financial return of a Tesla
Powerwall 3 in CMP (Central Maine Power) territory, stacking three revenue
streams: the Efficiency Maine VPP payment, CMP time-of-use (TOU) rate arbitrage,
and an optional hybrid of both.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Recharts. All
calculations run in the browser — there is no backend.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # vitest — financial calc unit tests
npm run lint
npm run build    # static export to ./out
```

Run a single test file: `npx vitest run lib/calculations.test.ts`

## Architecture

The financial model is the core, isolated as pure functions in `lib/`:

- `lib/constants.ts` — CMP rates (effective Jan 1 2026), model constants, defaults.
- `lib/calculations.ts` — `calcYear1Breakdown()` and `calcRoi()`. No React, no side effects.
- `lib/types.ts` — shared interfaces.

The UI (`app/page.tsx`) holds a single `InputParams` state object, recomputes the
ROI on every change, and renders input panels (`components/inputs/`) and result
views (`components/results/`). Scenario tabs switch between VPP-only, TOU-only,
and hybrid.

See `CLAUDE.md` for the business-logic invariants that are easy to get wrong
(recharge cost embedding, the discharge cap asymmetry, degradation vs. escalation).

## Deployment

Configured for **GitHub Pages** static export. The repo serves from
`https://<user>.github.io/battery_roi/`, so `next.config.js` sets
`basePath: '/battery_roi'`. The workflow in `.github/workflows/deploy.yml` builds
and publishes `out/` on every push to `main`.

To host at a domain root or on Vercel instead, set the `NEXT_PUBLIC_BASE_PATH`
env var to an empty string at build time.
