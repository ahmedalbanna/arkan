/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'firebase-admin',
      '@google-cloud/storage',
      'google-auth-library',
      'gcp-metadata',
      'gtoken',
      'teeny-request',
      'http-proxy-agent',
      'https-proxy-agent',
      'agent-base',
      '@firebase/database-compat'
    ],
  },
  webpack: (config, { isServer }) => {
    // حل مشكلة الوحدات غير المتوفرة في المتصفح
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        child_process: false,
        http2: false,
        util: false,
        url: false,
        querystring: false,
        buffer: false,
        events: false,
        assert: false,
        constants: false,
        timers: false,
        punycode: false,
        string_decoder: false,
        vm: false,
        domain: false,
        process: false,
        console: false,
        global: false,
        Buffer: false,
        __dirname: false,
        __filename: false,
      };
    }

    return config;
  },
  // تحسين الأداء
  swcMinify: true,
  compress: true,
  // إعدادات الصور
  images: {
    domains: ['firebasestorage.googleapis.com', 'placehold.co', 'www.plantuml.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // إعدادات الأمان
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // إعدادات إعادة التوجيه
  async redirects() {
    return [
      // إعادة توجيهات مخصصة هنا
    ];
  },
  // إعدادات إعادة الكتابة
  async rewrites() {
    return [
      // إعادة كتابة مخصصة هنا
    ];
  },
};

module.exports = nextConfig;
