import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site";
import { publishedPages } from "@/lib/page-store";
import { baseUrl } from "@/lib/metadata";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite(),
    base = baseUrl(site);
  if (!base || !site?.settings.index) return [];
  const pages = await publishedPages();
  const extra = pages
    .filter(({ published: p }) => p.seo.index && p.seo.sitemap)
    .map(({ published: p }) => ({ url: base + "/" + p.slug }));
  return base &&
    site?.page.seo.sitemap &&
    site.page.seo.index &&
    site.settings.index &&
    site.page.status === "published"
    ? [{ url: base + "/" }, ...extra]
    : extra;
}
