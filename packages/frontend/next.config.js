/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL_FOR_SERVER || 'http://api:3000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;