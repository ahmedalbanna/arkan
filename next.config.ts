
import type { NextConfig, SizeLimit } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // Enable React strict mode for better development experience
  output: 'standalone',
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,

  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
    turbo: {
      resolveAlias: {
        'react': 'react-18',
        'react-dom': 'react-dom-18',
      },

    },
    serverActions: { bodySizeLimit: '10mb' as SizeLimit },

    useCache: true,
    allowDevelopmentBuild: true,


  }
};

export default nextConfig;
