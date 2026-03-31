/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/jcash-main.html' },
      ],
    }
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '/coins/images/**',
      },
    ],
  },
};

export default nextConfig;
