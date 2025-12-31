import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],

  // Static export configuration for deployment
  output: 'export',
  // basePath: '/crazytaxi',

  // Required for static export with images
  images: {
    unoptimized: true,
  },
}

export default nextConfig
