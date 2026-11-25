import { notFound, redirect, permanentRedirect } from "next/navigation";
import { getSite } from "@/lib/site";
import { publicPage } from "@/lib/page-store";
import { homeMetadata } from "@/lib/metadata";
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
  const metadata = homeMetadata({
    ...site,
    page: {
      ...site.page,
      seo: {
        ...page.seo,
        title: page.seo.title || page.title,
        canonical: page.seo.canonical || "/" + page.slug,
      },
    },
  });
  const canonical = metadata.alternates?.canonical;
  if (metadata.openGraph && canonical)
    metadata.openGraph.url = String(canonical);
  if (!process.env.MONGODB_URI)
    metadata.robots = { index: false, follow: false };
  return metadata;
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
  if (site && page) return <ContentPage page={page} site={site} />;
  const match = site?.settings.redirects.find((r) => r.from === path);
  if (!match) notFound();
  if (match.permanent) permanentRedirect(match.to);
  redirect(match.to);
}
