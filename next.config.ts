
import type { NextConfig, SizeLimit } from 'next';
import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable React strict mode for better development experience
  output: 'standalone',
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
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
  webpack: (config, { isServer }) => {
    // Fix for canvas in server-side rendering
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'canvas',
        'pdf-parse': 'pdf-parse',
      });
    }

    // Exclude async_hooks from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
      };
    }
    
    return config;
  },
  experimental: {
    turbo: {
    },
    serverActions: { bodySizeLimit: '10mb' as SizeLimit },
    useCache: true,
    allowDevelopmentBuild: true,
  }
};

export default pwaConfig(nextConfig);
