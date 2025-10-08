
import type { NextConfig } from 'next';

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable React strict mode for better development experience
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Server configuration to prevent port conflicts
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 9002,
  },

  // Performance optimizations
  experimental: {
    // optimizeCss: true, // Removed - causing critters module error
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'recharts'],
    // modularizeImports removed - not supported in Next.js 15.3.3
  },

  // Bundle optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
  webpack: (config, { isServer, dev }) => {
    // Handle PDF.js worker for client-side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.mjs',
      };
    }

    // Add fallback for Node.js modules that might be needed
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      os: false,
      stream: false,
      util: false,
    };

    // Handle handlebars and other problematic modules
    config.module.rules.push({
      test: /\.handlebars$/,
      use: 'handlebars-loader'
    });

    // Ignore problematic modules that cause webpack warnings
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'handlebars': 'handlebars',
        'dotprompt': 'dotprompt'
      });
    }

    // Optimize bundle splitting for better caching
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 20,
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
          },
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 12,
          },
          documents: {
            test: /[\\/]node_modules[\\/](docx|pptxgenjs|pdfjs-dist)[\\/]/,
            name: 'documents',
            chunks: 'all',
            priority: 12,
          },
        },
      };
    }

    // Suppress specific webpack warnings
    config.ignoreWarnings = [
      /require\.extensions is not supported by webpack/,
      /Module not found: Error: Can't resolve/,
    ];

    return config;
  },

  async rewrites() {
    return [
      {
        source: '/_next/static/chunks/pdf.worker.mjs',
        destination: '/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
      },
      {
        source: '/pdf.worker.mjs',
        destination: '/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
      },
    ]
  }
};

export default withBundleAnalyzer(nextConfig);
