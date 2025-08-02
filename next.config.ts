
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable React strict mode for better development experience
  output: 'standalone',
  
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
  webpack: (config, { isServer }) => {
    // Correctly configure the pdf.js worker.
    // This is a robust way to ensure the worker file is copied to the build output
    // and is accessible via a public URL.
    config.module.rules.push({
      test: /pdf\.worker\.mjs$/,
      type: "asset/resource",
      generator: {
        filename: "static/chunks/[name][ext]",
      },
    });

    return config;
  },
};

export default nextConfig;
