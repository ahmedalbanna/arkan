
import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable React strict mode for better development experience
  swcMinify: true, // Enable SWC minification for faster builds
  
  webpack: (config, { isServer }) => {
    // Copy the pdf.js worker file to the static chunks directory
    config.module.rules.push({
      test: /pdf\.worker\.mjs$/,
      type: "asset/resource",
      generator: {
        filename: "static/chunks/[name][ext]",
      },
    });

    return config;
  },

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
};

export default nextConfig;
