
import type { NextConfig } from 'next';

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

  // تحسين Bundle Size
  webpack: (config, { isServer }) => {
    // إصلاح مشكلة Node.js APIs في المتصفح
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        dns: false,
        async_hooks: false,
        dgram: false,
        child_process: false,
        cluster: false,
        worker_threads: false,
        perf_hooks: false,
        inspector: false,
        trace_events: false,
        vm: false,
        v8: false,
        buffer: false,
        util: false,
        events: false,
        querystring: false,
        punycode: false,
        string_decoder: false,
        timers: false,
        console: false,
        process: false,
        global: false,
        Buffer: false,
        __dirname: false,
        __filename: false,
      };
    }

    // إصلاح مشكلة handlebars مع webpack
    config.module.rules.push({
      test: /\.handlebars$/,
      use: 'handlebars-loader'
    });

    // تجاهل تحذيرات require.extensions
    config.ignoreWarnings = [
      /require\.extensions is not supported by webpack/,
    ];

    // تحسين Bundle Size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -5,
            reuseExistingChunk: true,
          },
        },
      },
    };

    return config;
  },

  // تحسينات إضافية لـ Bundle Size
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    optimizeCss: false, // تعطيل مؤقتاً لتجنب مشاكل critters
    optimizeServerReact: true,
  },

  // تحسين الأداء
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // تحسين الصور
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
  allowedDevOrigins: ["http://localhost:9002"],
  async rewrites() {
    return [
      {
        source: '/_next/static/chunks/pdf.worker.mjs',
        destination: '/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
      },
    ]
  }
};

export default withBundleAnalyzer(nextConfig);
