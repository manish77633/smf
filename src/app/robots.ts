import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site";
import { baseUrl } from "@/lib/metadata";
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite(),
    base = baseUrl(site);
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
    sitemap:
      base && site?.settings.index && !site.bundled && process.env.MONGODB_URI && process.env.VERCEL_ENV !== "preview"
        ? base + "/sitemap.xml"
        : undefined,
  };
}
