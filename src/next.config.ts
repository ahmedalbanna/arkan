
import type {NextConfig} from 'next';
import fs from 'fs';

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
  allowedDevOrigins: ["https://9000-firebase-studio-1754388625396.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev", "https://6000-firebase-studio-1754388625396.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev"],
  async rewrites() {
    return [
      {
        source: '/pdf.worker.mjs',
        destination: '/node_modules/pdfjs-dist/build/pdf.worker.mjs',
      },
    ]
  }
};

export default nextConfig;
