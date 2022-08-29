/** @type {import('next').NextConfig} */
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
};

module.exports = nextConfig;
