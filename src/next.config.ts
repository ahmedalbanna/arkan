

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable React strict mode for better development experience
  swcMinify: true, // Enable SWC minification for faster builds
  // Add any custom configurations here
  // For example:
  // env: {
  //   CUSTOM_VARIABLE: process.env.CUSTOM_VARIABLE,
  // },
  // images: {
  //   domains: ['example.com'], // Allow images from this domain
  // },
  // async redirects() {
  //   return [
  //     {
  //       source: '/old-path',
  //       destination: '/new-path',
  //       permanent: true,
  //     },
  //   ];
  // },
  /* config options here */
  experimental: {
    // prefetchInRender: true,
  },
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
  }
};

export default nextConfig;
