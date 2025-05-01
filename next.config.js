/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://indirect-yasmin-ananana-483e9951.koyeb.app/:path*', // Proxy to backend
      },
    ];
  },
};

module.exports = module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.trn.asia',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      // Add more as needed
    ],
  },
};
