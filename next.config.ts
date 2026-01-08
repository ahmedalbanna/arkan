
import type { NextConfig, SizeLimit } from 'next';

const nextConfig: NextConfig = {
  // SECURITY: React Strict Mode enabled for better development experience and bug detection
  reactStrictMode: true,
  output: 'standalone',
  
  // // SECURITY: Only ignore build errors in development, enforce in production
  // typescript: {
  //   ignoreBuildErrors: process.env.NODE_ENV === 'development',
  // },
  // eslint: {
  //   ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.plantuml.com',
        port: '',
        pathname: '/plantuml/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/_next/static/chunks/pdf.worker.mjs',
        destination: '/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
      },
    ]
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' as SizeLimit },
    useCache: true,
  },
  turbopack: {
    // Add any TurboPack specific configurations here if needed
    // Explicitly set the project root to resolve ambiguity and fix routing.
    // root: '.',
  }
};

export default nextConfig;
