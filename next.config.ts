// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   output: 'standalone',
//   experimental: {
//     serverComponentsExternalPackages: ['@sparticuz/chromium']
//   },
// };

// export default nextConfig;









// ✅ New / Correct configuration in next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Key is renamed and moved to the top level
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
};

export default nextConfig;