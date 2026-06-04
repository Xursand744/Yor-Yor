/** @type {import('next').NextConfig} */
const isStaticExport = process.env.BUILD_STATIC === "1";

const nextAuthUrl =
  process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_NEXTAUTH_URL || "";

const nextConfig = {
  ...(isStaticExport ? { output: "export" } : {}),
  env: {
    NEXTAUTH_URL: nextAuthUrl,
  },
  images: {
    unoptimized: isStaticExport,
  },
};

export default nextConfig;
