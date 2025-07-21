
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
        source: '/pdfjs-dist/legacy/build/pdf.worker.mjs',
        destination: '/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
      },
    ]
  }
};

export default nextConfig;
