import { bundledMedia } from "@/lib/bundled-media";
import { notFound, redirect } from "next/navigation";
import { adminEmail } from "@/auth";
import { AuditLog, connect, Media, Page } from "@/lib/db";
import { getDraft } from "@/lib/site";
import { emptySeo } from "@/lib/seed-content";
import type { PageRecord } from "@/lib/page-store";
import PageEditor from "@/components/page-editor";
import LinkDestinations from "@/components/link-destinations";
export default async function Edit({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await adminEmail())) redirect("/admin/login");
  const { slug } = await params;
  await connect();
  const [record, media, site, pages] = await Promise.all([
    slug === "new"
      ? null
      : Page.findOne({ key: "page:" + slug })
          .select("draft published.slug revision createdAt -_id")
          .lean<PageRecord & { createdAt?: Date }>(),
    Media.find({ deleting: { $ne: true } })
      .select("url alt -_id")
      .lean<{ url: string; alt: string }[]>(),
    getDraft(),
    Page.find({ key: /^page:/ })
      .sort({ "draft.title": 1 })
      .select("draft.slug draft.title -_id")
      .lean<{ draft: { slug: string; title: string } }[]>(),
  ]);
  if (slug !== "new" && !record) notFound();
  const history = record
    ? await AuditLog.find({
        target: "page:" + slug,
        action: "publish-page",
        ...(record.createdAt && { createdAt: { $gte: record.createdAt } }),
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("createdAt -_id")
        .lean<{ createdAt: Date }[]>()
    : [];
  return (
    <>
      <LinkDestinations pages={pages.map(({ draft }) => draft)} />
      <PageEditor
        key={slug}
        initial={
          record?.draft || { title: "", slug: "", seo: emptySeo, sections: [] }
        }
        initialRevision={record?.revision ?? -1}
        history={history.map(({ createdAt }) => createdAt.toISOString())}
        published={!!record?.published}
        media={[...media, ...bundledMedia]}
        loans={site.records.loans.map(({ title, slug }) => ({ title, slug }))}
      />
    </>
  );
}
