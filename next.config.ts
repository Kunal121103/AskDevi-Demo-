import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,  // Recommended to help identify potential problems
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],  // Ensure Next.js recognizes .tsx, .ts, .jsx, and .js files as pages
};

export default nextConfig;
