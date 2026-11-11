/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server (.next/standalone/server.js) for cPanel / Passenger:
  // no `npm install` or build is needed on the server.
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // The app renders plain <img> tags and never uses next/image, so the
    // built-in optimizer is turned off instead of acting as an open image proxy.
    unoptimized: true,
  },
};

export default nextConfig;
