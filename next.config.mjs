/** @type {import('next').NextConfig} */
// Vercelda API + Prisma kerak — static export faqat lokal APK uchun.
const isStaticExport =
  process.env.BUILD_STATIC === "1" && !process.env.VERCEL;

/** @param {string | undefined} value */
function normalizeOrigin(value) {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.origin;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

const nextAuthUrl =
  normalizeOrigin(process.env.NEXTAUTH_URL) ??
  normalizeOrigin(process.env.NEXT_PUBLIC_NEXTAUTH_URL) ??
  (process.env.VERCEL_URL
    ? normalizeOrigin(`https://${process.env.VERCEL_URL}`)
    : undefined) ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : undefined);

if (isStaticExport && process.env.VERCEL) {
  console.warn(
    "[next.config] BUILD_STATIC=1 Vercelda tavsiya etilmaydi — API va Prisma uchun oddiy `next build` ishlating."
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isStaticExport ? { output: "export" } : {}),
  ...(nextAuthUrl ? { env: { NEXTAUTH_URL: nextAuthUrl } } : {}),
  images: {
    unoptimized: isStaticExport,
  },
};

export default nextConfig;
