/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
