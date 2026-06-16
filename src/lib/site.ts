// Canonical site URL used for metadata, OG images, robots and sitemap.
// Set NEXT_PUBLIC_SITE_URL in Vercel once the real domain is connected;
// otherwise it auto-uses the Vercel production URL, then localhost in dev.
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3010";
}
