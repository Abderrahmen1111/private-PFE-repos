/** @type {import('next').NextConfig} */

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT SECURITY POLICY
// Définit quelles sources de contenu sont autorisées.
// Adapte les domaines selon tes besoins (ex: CDN, analytics, etc.)
// ─────────────────────────────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV === 'development'

const ContentSecurityPolicy = `default-src 'self'; script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://*.unsplash.com https://lh3.googleusercontent.com https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com https://streetviewpixels-pa.googleapis.com https://*.googleusercontent.com https://upload.wikimedia.org https://*.cloudinary.com https://res.cloudinary.com https://*.mapbox.com *; media-src 'self' https://res.cloudinary.com https://*.cloudinary.com blob: data:; connect-src 'self' https://*.supabase.co https://*.supabase.io wss://*.supabase.co https://*.mapbox.com https://events.mapbox.com${isDev ? ' ws://localhost:3000 http://localhost:3000' : ''}; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;`
  .replace(/\s{2,}/g, ' ')
  .trim()

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY HEADERS
// ─────────────────────────────────────────────────────────────────────────────

const securityHeaders = [
  // Prevents clickjacking
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevents MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Referrer policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Restrict browser features
  {
    key: 'Permissions-Policy',
    value: [
      'camera=(self)',
      'microphone=(self)',
      'geolocation=(self)',
      'interest-cohort=()',
      'payment=(self)',
      'usb=(self)',
      'bluetooth=()',
    ].join(', '),
  },
  // HSTS — production uniquement
  ...(isDev
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]),
  // Cross-origin policies
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'credentialless',
  },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// NEXT CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      // Uncomment et adapter quand tu auras ton domaine :
      // {
      //   source: '/:path*',
      //   has: [{ type: 'host', value: 'www.ton-domaine.com' }],
      //   destination: 'https://ton-domaine.com/:path*',
      //   permanent: true,
      // },
    ]
  },

  poweredByHeader: false,   // Supprime "X-Powered-By: Next.js"
  compress: true,
  reactStrictMode: true,
  swcMinify: true, // Use SWC for lighter, faster minification
  
  images: {
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
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  experimental: {
    webpackBuildWorker: true,
    cpus: 2,
    optimizePackageImports: ['@supabase/supabase-js', 'zustand', 'framer-motion', 'three'],
    // Dynamic imports for Three.js to reduce initial bundle
    esmExternals: true,
    isrMemoryCacheSize: 50 * 1024 * 1024, // 50MB ISR cache
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.devtool = false;
      
      // Optimize minifier to run sequentially and conserve memory
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer.forEach((plugin) => {
          if (plugin.constructor && plugin.constructor.name === 'TerserPlugin') {
            if (plugin.options) {
              plugin.options.parallel = 1;
              plugin.options.terserOptions = {
                compress: {
                  drop_console: true,
                  drop_debugger: true,
                  passes: 1,
                  pure_funcs: ['console.log', 'console.info'],
                },
                mangle: {
                  safari10: true,
                },
              };
            }
          }
        });
      }
      
      // Advanced chunk splitting strategy for memory efficiency
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        minChunks: 1,
        cacheGroups: {
          // React & core deps
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-hook-form)[\\/]/,
            name: 'chunk-react',
            priority: 50,
            reuseExistingChunk: true,
            enforce: true,
          },
          // UI libraries (Radix, Lucide, Sonner)
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|sonner|embla-carousel)[\\/]/,
            name: 'chunk-ui',
            priority: 40,
            reuseExistingChunk: true,
            enforce: true,
          },
          // 3D libraries (Three.js, Drei, Fiber)
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'chunk-three',
            priority: 35,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Mapping & geolocation
          maps: {
            test: /[\\/]node_modules[\\/](mapbox-gl|leaflet)[\\/]/,
            name: 'chunk-maps',
            priority: 30,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Backend & API
          supabase: {
            test: /[\\/]node_modules[\\/](@supabase|@upstash)[\\/]/,
            name: 'chunk-api',
            priority: 25,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Analytics & AI
          external: {
            test: /[\\/]node_modules[\\/](openai|@google\/generative-ai|recharts)[\\/]/,
            name: 'chunk-external',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Everything else in node_modules
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'chunk-vendors',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Common code between chunks
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
            name: 'chunk-common',
          },
        },
      };
    }
    
    // Reduce stats output to save memory during build
    config.stats = {
      preset: 'minimal',
      modules: false,
      colors: true,
    };
    
    return config;
  },
}

module.exports = nextConfig