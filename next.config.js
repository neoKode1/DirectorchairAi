/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration to prevent static generation issues
  output: 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Production optimizations
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'lucide-react'],
  },

  // Error handling and fallbacks
  async redirects() {
    return [
      // Redirect root to timeline for better UX
      {
        source: '/',
        destination: '/timeline',
        permanent: false,
      },
    ];
  },

  // Serve static files from uploads directory
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },

  // Production headers for better security and performance
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

  // Build optimizations
  compress: true,
  
  // Handle client-side errors gracefully
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Prevent static generation of API routes during build
  async generateStaticParams() {
    return [];
  },

  // Disable static generation for problematic routes
  trailingSlash: false,
  poweredByHeader: false,
};

export default nextConfig;
