/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": require("path").resolve(__dirname), // Alias "@" to the root directory
    };
    return config;
  },
};

export default nextConfig;
