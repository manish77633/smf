import { bundledMedia } from "@/lib/bundled-media";
import { notFound, redirect } from "next/navigation";
import { adminEmail } from "@/auth";
import { connect, Media, Page } from "@/lib/db";
import { getDraft } from "@/lib/site";
import { emptySeo } from "@/lib/seed-content";
import type { PageRecord } from "@/lib/page-store";
import PageEditor from "@/components/page-editor";
export default async function Edit({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await adminEmail())) redirect("/admin/login");
  const { slug } = await params;
  await connect();
  const [record, media, site] = await Promise.all([
    slug === "new"
      ? null
      : Page.findOne({ key: "page:" + slug })
          .select("draft published.slug revision -_id")
          .lean<PageRecord>(),
    Media.find({ deleting: { $ne: true } })
      .select("url alt -_id")
      .lean<{ url: string; alt: string }[]>(),
    getDraft(),
  ]);
  if (slug !== "new" && !record) notFound();
  return (
    <PageEditor
      key={slug}
      initial={
        record?.draft || { title: "", slug: "", seo: emptySeo, sections: [] }
      }
      initialRevision={record?.revision ?? -1}
      published={!!record?.published}
      media={[...media, ...bundledMedia]}
      loans={site.records.loans.map(({ title, slug }) => ({ title, slug }))}
    />
  );
}
