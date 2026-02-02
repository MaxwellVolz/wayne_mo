import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],

  // Static export configuration for deployment
  output: 'export',

  // Required for static export with images
  images: {
    unoptimized: true,
  },
}

export default nextConfig
//