import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://va.vercel-scripts.com https://cdnjs.cloudflare.com",
              "worker-src 'self' blob: data:",
              "child-src 'self' blob: data:",
              "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https://*.openstreetmap.org https://*.tile.openstreetmap.org https://unpkg.com https://cdnjs.cloudflare.com https://*.basemaps.cartocdn.com https://cdn.jsdelivr.net https://img.icons8.com",
              "font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
              "connect-src 'self' https://*.openstreetmap.org https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
              "media-src 'self' blob: data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "frame-src 'self' blob:",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ]
  },

  // External packages that should not be bundled
  serverExternalPackages: ['bcryptjs', '@prisma/client'],

  // Performance optimizations
  experimental: {
    cssChunking: 'strict',

    // Server actions configuration
    serverActions: {
      bodySizeLimit: '250mb',
    },
  },

  // Webpack configuration to handle workers properly
  webpack: (config, { isServer }) => {
    // Handle worker files
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: {
        loader: 'worker-loader',
        options: {
          name: 'static/[hash].worker.js',
          publicPath: '/_next/',
        },
      },
    });

    // Handle Three.js and other large libraries
    config.module.rules.push({
      test: /three\/examples\/jsm/,
      sideEffects: false,
    });

    // Optimize for client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },

  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
      // Handle worker files in Turbopack
      '*.worker.js': {
        loaders: ['worker-loader'],
        as: '*.js',
      },
      '*.worker.ts': {
        loaders: ['worker-loader'],
        as: '*.js',
      },
    },
    resolveAlias: {
      '@': './src',
    },
  },

  // Enable compression
  compress: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Output configuration
  output: 'standalone',
};

export default nextConfig;