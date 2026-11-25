import { notFound, redirect } from "next/navigation";
import { adminEmail } from "@/auth";
import { connect, Page } from "@/lib/db";
import { getDraft } from "@/lib/site";
import type { PageRecord } from "@/lib/page-store";
import { ContentPage } from "@/components/content-page";
export default async function Preview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await adminEmail())) redirect("/admin/login");
  const { slug } = await params;
  await connect();
  const [page, site] = await Promise.all([
    Page.findOne({ key: "page:" + slug })
      .select("draft -_id")
      .lean<PageRecord>(),
    getDraft(),
  ]);
  if (!page) notFound();
  return (
    <div className="admin-public-preview">
      <p className="bg-navy p-3 text-center text-sm text-white">
        Saved draft preview
      </p>
      <ContentPage page={page.draft} site={site} />
    </div>
  );
}
