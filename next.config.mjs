/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // 启用 SWC 压缩
  ...(process.env.NODE_ENV === "production"
    ? {
        output: "export",
        distDir: "out",
      }
    : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
