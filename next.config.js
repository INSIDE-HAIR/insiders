/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Recommended for the `pages` directory, default in `app`.
  swcMinify: true,
  images: {
    domains: ["localhost", "images.unsplash.com", "lh3.googleusercontent.com"],
  },
};

module.exports = nextConfig;
