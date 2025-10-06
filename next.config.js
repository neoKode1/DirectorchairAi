/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // Fix webpack compatibility issues with Radix UI
    webpackBuildWorker: false,
  },

  // Webpack configuration to fix Radix UI compatibility
  webpack: (config, { isServer }) => {
    // Fix for Radix UI webpack issues
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@radix-ui/react-id': 'commonjs @radix-ui/react-id',
        '@radix-ui/react-dialog': 'commonjs @radix-ui/react-dialog',
      });
    }

    // Ensure proper module resolution
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
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

  // Disable static generation for problematic routes
  trailingSlash: false,
  poweredByHeader: false,

  // Transpile packages to fix compatibility issues
  transpilePackages: [
    '@radix-ui/react-id',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-select',
    '@radix-ui/react-tabs',
    '@radix-ui/react-toast',
    '@radix-ui/react-accordion',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-collapsible',
    '@radix-ui/react-label',
    '@radix-ui/react-progress',
    '@radix-ui/react-radio-group',
    '@radix-ui/react-separator',
    '@radix-ui/react-slider',
    '@radix-ui/react-switch',
  ],
};

export default nextConfig;
