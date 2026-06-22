/** @type {import('next').NextConfig} */

// Served from https://<user>.github.io/battery_roi/ on GitHub Pages.
// Set NEXT_PUBLIC_BASE_PATH='' (or remove) when hosting at a domain root / Vercel.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/battery_roi';

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;
