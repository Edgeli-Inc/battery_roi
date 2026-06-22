import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Powerwall ROI Estimator',
  description:
    'Estimate the financial return of a Tesla Powerwall 3 in CMP / Versant territory — VPP payments, TOU arbitrage, and a 15-year payback model.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
