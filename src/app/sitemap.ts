import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site";
import { publishedPages } from "@/lib/page-store";
import { baseUrl, canonicalUrl } from "@/lib/metadata";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!process.env.MONGODB_URI || process.env.VERCEL_ENV === "preview") return [];
  const site = await getSite(),
    base = baseUrl(site);
  if (!base || !site?.settings.index || site.bundled) return [];
  const pages = await publishedPages();
  const entries = pages.map(({ published: p }) => ({ path: "/" + p.slug, seo: p.seo }));
  if (site.page.status === "published") entries.unshift({ path: "/", seo: site.page.seo });
  return entries
    .filter(({ path, seo }) => seo.index && seo.sitemap && canonicalUrl(seo.canonical, path, base) === base + path)
    .map(({ path }) => ({ url: base + path }));
}
