
import type { NextConfig, SizeLimit } from 'next';
import withPWA from "@ducanh2912/next-pwa";
import path from 'path';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable React strict mode for better development experience
  output: 'standalone',
  transpilePackages: ['tsyringe'],
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

    // Suppress specific warnings
    config.ignoreWarnings = config.ignoreWarnings || [];
    config.ignoreWarnings.push(
      { module: /@opentelemetry\/instrumentation/ },
      { module: /handlebars/ }
    );

    return config;
  },
  turbopack: {
    resolveAlias: {
      // Node.js built-ins used by Genkit/Express/Ollama — stub them out in the browser bundle
      // Use the browser field to ensure aliases ONLY apply to the client bundle
      async_hooks: { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      fs: { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      net: { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      perf_hooks: { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      os: { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      path: { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      crypto: { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      buffer: { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      stream: { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      util: { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      url: { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      events: { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      'node:fs': { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      'node:net': { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      'node:perf_hooks': { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      'node:os': { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      'node:path': { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      'node:crypto': { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      'node:buffer': { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      'node:stream': { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      'node:util': { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      'node:url': { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
      'node:events': { browser: './src/infrastructure/stubs/async-hooks-stub.js' },
    },
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' as SizeLimit },
    useCache: true,
  }
};

export default pwaConfig(nextConfig);
