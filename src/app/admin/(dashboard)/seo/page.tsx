import Link from "next/link";
import { redirect } from "next/navigation";
import { adminEmail } from "@/auth";
import SeoEditor from "@/components/seo-editor";
import type { Asset } from "@/components/media-picker";
import { bundledMedia } from "@/lib/bundled-media";
import { connect, Media, Page } from "@/lib/db";
import { baseUrl } from "@/lib/metadata";
import type { PageRecord } from "@/lib/page-store";
import { seoSettings } from "@/lib/seo-settings";
import { getDraft, getSite } from "@/lib/site";

export default async function SeoPage({
  searchParams,
}: {
  searchParams: Promise<{ target?: string }>;
}) {
  if (!(await adminEmail())) redirect("/admin/login");
  const { target } = await searchParams;
  await connect();
  const [site, liveSite, pages, media] = await Promise.all([
    getDraft(),
    getSite(),
    Page.find({ key: /^page:/ })
      .select("draft.title draft.seo draft.slug published.slug revision -_id")
      .sort({ "draft.title": 1 })
      .lean<PageRecord[]>(),
    Media.find({ deleting: { $ne: true } }).select("url alt -_id").lean<Asset[]>(),
  ]);
  const page = pages.find(({ draft }) => target === "page:" + draft.slug);
  const homepage = target === "home";
  const selection = page ? "page:" + page.draft.slug : homepage ? "home" : "site";
  const settings = seoSettings.parse(site.settings);
  const hasLiveSite = !!liveSite && !liveSite.bundled;
  const targets = [
    { key: "site", title: "Site defaults" },
    { key: "home", title: "Homepage", path: "/" },
    ...pages.map(({ draft }) => ({ key: "page:" + draft.slug, title: draft.title, path: "/" + draft.slug })),
  ];
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-3xl font-extrabold">SEO</h1>
      <p className="mb-5 mt-2 text-sm text-muted">Manage search and social appearance for the site and individual pages.</p>
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(165px,205px)_minmax(0,1fr)]">
        <nav aria-label="SEO targets" className="panel grid max-h-[45vh] gap-1 overflow-auto p-2 lg:max-h-[72vh]">
          {targets.map(({ key, title, path }) => (
            <Link
              key={key}
              href={key === "site" ? "/admin/seo" : "/admin/seo?target=" + encodeURIComponent(key)}
              aria-current={selection === key ? "page" : undefined}
              className="min-w-0 rounded-md px-3 py-2 text-sm font-bold hover:bg-tint aria-[current=page]:bg-softblue"
            >
              <span className="block break-words">{title}</span>
              {path && <span className="block truncate text-xs font-normal text-muted">{path}</span>}
            </Link>
          ))}
        </nav>
        <SeoEditor
          key={selection}
          initial={page
            ? { target: "page", slug: page.draft.slug, title: page.draft.title, value: page.draft.seo }
            : homepage
              ? { target: "home", title: "Homepage", value: site.page.seo }
              : { target: "site", value: settings }}
          initialRevision={page?.revision ?? site.revision}
          live={page ? !!page.published : hasLiveSite && (!homepage || liveSite.page.status === "published")}
          settings={settings}
          base={baseUrl(site)}
          media={[...media, ...bundledMedia]}
        />
      </div>
    </div>
  );
}
