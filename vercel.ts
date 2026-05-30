import { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  framework: 'nextjs',
  
  // ─────────────────────────────────────────────────────────────────────────────
  // BUILD & INSTALL COMMANDS
  // ─────────────────────────────────────────────────────────────────────────────
  buildCommand: 'cross-env NODE_OPTIONS="--max-old-space-size=6144" next build',
  installCommand: 'pnpm install --frozen-lockfile',
  devCommand: 'next dev --turbo',
  
  // ─────────────────────────────────────────────────────────────────────────────
  // ENVIRONMENT-BASED BUILD CONFIG
  // ─────────────────────────────────────────────────────────────────────────────
  build: {
    env: {
      NODE_OPTIONS: '--max-old-space-size=6144',
      NODE_ENV: 'production',
      // Disable telemetry to speed up builds
      NEXT_TELEMETRY_DISABLED: '1',
      // Enable SWC minification for faster builds
      SWCMINIFY: 'true',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CACHE DIRECTORIES
  // Persistent caching across deployments to speed up rebuilds
  // ─────────────────────────────────────────────────────────────────────────────
  cacheDirectories: [
    '.next/cache',           // Next.js build cache
    'node_modules/.pnpm',    // pnpm cache
    '.pnpm-store',           // pnpm store
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // IMAGE OPTIMIZATION
  // ─────────────────────────────────────────────────────────────────────────────
  images: {
    sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
      { protocol: 'https', hostname: '*.googleapis.com' },
      { protocol: 'https', hostname: '*.gstatic.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: '*.mapbox.com' },
    ],
    minimumCacheTTL: 31536000, // 1 year for images
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FUNCTION CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────────
  functions: {
    'app/api/**/*.{js,ts}': {
      memory: 1024,           // 1GB memory for API routes
      maxDuration: 60,        // 60 second timeout
      runtime: 'nodejs20.x',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FLUID COMPUTE
  // Enable auto-scaling for functions based on load
  // ─────────────────────────────────────────────────────────────────────────────
  fluid: true,

  // ─────────────────────────────────────────────────────────────────────────────
  // SCHEDULED CRONS
  // Run functions at specific times (e.g., nightly cleanup, data sync)
  // ─────────────────────────────────────────────────────────────────────────────
  crons: [
    {
      path: '/api/cron/cleanup',
      schedule: '0 2 * * *',  // Daily at 2 AM UTC
    },
    {
      path: '/api/cron/sync-data',
      schedule: '0 */6 * * *', // Every 6 hours
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // HEADERS
  // Cache static assets aggressively
  // ─────────────────────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // REDIRECTS
  // ─────────────────────────────────────────────────────────────────────────────
  async redirects() {
    return [];
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // REWRITES
  // ─────────────────────────────────────────────────────────────────────────────
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // IGNORE BUILD COMMAND
  // Skip builds for non-critical changes (e.g., README updates, docs)
  // ─────────────────────────────────────────────────────────────────────────────
  ignoreCommand: `bash -c 'if [ -z "$VERCEL_ENV_GIT_COMMIT_MESSAGE" ]; then exit 0; fi; echo "$VERCEL_ENV_GIT_COMMIT_MESSAGE" | grep -qiE "^(docs|chore|style|test|readme|ci|workflows)" && exit 1 || exit 0'`,

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC LOGS
  // Make deployment logs publicly accessible for sharing/debugging
  // ─────────────────────────────────────────────────────────────────────────────
  public: true,

  // ─────────────────────────────────────────────────────────────────────────────
  // CLEAN URLS
  // Remove .html extensions from URLs
  // ─────────────────────────────────────────────────────────────────────────────
  cleanUrls: true,

  // ─────────────────────────────────────────────────────────────────────────────
  // TRAILING SLASH
  // ─────────────────────────────────────────────────────────────────────────────
  trailingSlash: false,

  // ─────────────────────────────────────────────────────────────────────────────
  // OUTPUT DIRECTORY
  // ─────────────────────────────────────────────────────────────────────────────
  outputDirectory: '.next',

  // ─────────────────────────────────────────────────────────────────────────────
  // REGIONS & FAILOVER
  // Deploy globally with automatic failover
  // ─────────────────────────────────────────────────────────────────────────────
  regions: ['iad1'],  // Default to US East (fastest for your deployment)
  functionFailoverRegions: ['lhr1'],  // Fallback to London
};

export default config;
