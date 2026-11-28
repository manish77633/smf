import { notFound, redirect, permanentRedirect } from "next/navigation";
import { getSite } from "@/lib/site";
import { publicPage } from "@/lib/page-store";
import { pageMetadata } from "@/lib/metadata";
import { publicLanguage, localize } from "@/lib/public-language";
import { ContentPage } from "@/components/content-page";
import { records } from "@/lib/seed-content";
type Props = { params: Promise<{ path: string[] }> };

export const revalidate = 300;

export function generateStaticParams() {
  const paths = new Set([
    "services",
    "contact",
    ...records.loans.map((loan) => loan.slug),
  ]);
  return [...paths].map((path) => ({ path: [path] }));
}

export async function generateMetadata({ params }: Props) {
  const { path } = await params;
  if (path.length !== 1) return {};
  const [page, site] = await Promise.all([publicPage(path[0]), getSite()]);
  if (!page || !site) return {};
  return pageMetadata(site, page.seo, "/" + page.slug, page.title);
}
export default async function RedirectPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const parts = (await params).path;
  const path = "/" + parts.join("/");
  const [site, page] = await Promise.all([
    getSite(),
    parts.length === 1 ? publicPage(parts[0]) : null,
  ]);
  if (site && page) {
    const language = await publicLanguage();
    return <ContentPage page={localize(page, language)} site={localize(site, language)} />;
  }
  const match = site?.settings.redirects.find((r) => r.from === path);
  if (!match) notFound();
  if (match.permanent) permanentRedirect(match.to);
  redirect(match.to);
}
