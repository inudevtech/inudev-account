/** @type {import('next').NextConfig} */
// eslint-disable-next-line import/no-extraneous-dependencies
require("dotenv").config();

const rewrites = [
  {
    source: "/api/:path*",
    destination: `${process.env.NEXT_PUBLIC_HOTDOG_URL}/api/:path*`,
  },
];

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  async rewrites() {
    return rewrites;
  },
};

module.exports = nextConfig;
