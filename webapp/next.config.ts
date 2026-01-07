import type { NextConfig } from 'next'

// Use basePath only for production builds
const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],

  // Static export configuration for deployment
  output: 'export',
  ...(isProd && {
    basePath: '/crazytaxi',
    assetPrefix: '/crazytaxi',
  }),

  // Required for static export with images
  images: {
    unoptimized: true,
  },
}

export default nextConfig
//