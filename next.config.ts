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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.openstreetmap.org https://*.tile.openstreetmap.org https://unpkg.com https://cdnjs.cloudflare.com https://*.basemaps.cartocdn.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.openstreetmap.org https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ]
  },
  
  // External packages that should not be bundled (moved from experimental)
  serverExternalPackages: ['bcryptjs', '@prisma/client'],
  
  // Performance optimizations
  experimental: {
    cssChunking: 'strict',
    
    // Server actions configuration
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    // Custom loaders for specific file types
    rules: {
      // SVG handling
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    // Turbopack resolver configuration
    resolveAlias: {
      // Add any custom path aliases if needed
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