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
    cpus: 1,
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.devtool = false;
      config.cache = false;
    }
    return config;
  },
}

module.exports = nextConfig