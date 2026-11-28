import { bundledMedia } from "@/lib/bundled-media";
import { redirect } from "next/navigation";
import { adminEmail } from "@/auth";
import Editor from "@/components/cms-editor";
import LinkDestinations from "@/components/link-destinations";
import { getDraft } from "@/lib/site";
import { Media, Page } from "@/lib/db";
export default async function CMS({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  if (!(await adminEmail())) redirect("/admin/login");
  const [{ tab }, initial, list, pages] = await Promise.all([
    searchParams,
    getDraft(),
    Media.find({ deleting: { $ne: true } })
      .sort({ createdAt: -1 })
      .select("url alt -_id")
      .lean<{ url: string; alt: string }[]>(),
    Page.find({ key: /^page:/ })
      .sort({ "draft.title": 1 })
      .select("key draft.title -_id")
      .lean<{ key: string; draft: { title: string } }[]>(),
  ]);
  initial.records.loans.sort((a, b) => a.order - b.order);
  return (
    <>
      <LinkDestinations
        pages={pages.map(({ key, draft }) => ({ slug: key.slice(5), title: draft.title }))}
      />
      <Editor
        key={tab || "overview"}
        tab={tab || "overview"}
        initial={initial}
        media={[...list, ...bundledMedia]}
        loanPageSlugs={pages.map((page) => page.key.slice(5))}
      />
    </>
  );
}
