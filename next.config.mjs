/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '/coins/images/**',
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/jcash-main.html' },
      ],
    }
  },
};

export default nextConfig;
