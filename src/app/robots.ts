import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site";
import { baseUrl } from "@/lib/metadata";
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite(),
    base = baseUrl(site);
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap:
      base &&
      site?.page.seo.sitemap &&
      site.page.seo.index &&
      site.settings.index &&
      site.page.status === "published"
        ? base + "/sitemap.xml"
        : undefined,
  };
}
