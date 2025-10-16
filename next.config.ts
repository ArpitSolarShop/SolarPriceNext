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
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core']
  }
};

export default nextConfig;