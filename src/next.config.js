
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  webpack: (config, { isServer }) => {
    // Copy the pdf.js worker file to the static chunks directory
    // This is needed for pdf.js to work correctly in Next.js
    const pdfWorkerPath = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'legacy', 'build', 'pdf.worker.mjs');
    config.module.rules.push({
      test: /pdf\.worker\.mjs$/,
      type: 'asset/resource',
      generator: {
        filename: isServer ? 'static/chunks/[name][ext]' : 'static/chunks/[name].[hash][ext]',
      },
    });

    config.resolve.alias['pdfjs-dist/legacy/build/pdf.worker.mjs'] = pdfWorkerPath;
    
    return config;
  },
  
  experimental: {
    // Your experimental features here
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
    return []; // No longer need rewrites for the PDF worker
  }
};

module.exports = nextConfig;
