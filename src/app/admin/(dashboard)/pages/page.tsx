import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, PanelsTopLeft, Plus } from "lucide-react";
import { adminEmail } from "@/auth";
import { connect, Page } from "@/lib/db";
import type { PageRecord } from "@/lib/page-store";

export default async function Pages() {
  if (!(await adminEmail())) redirect("/admin/login");
  await connect();
  const [rows, home] = await Promise.all([
    Page.find({ key: /^page:/ })
      .select("draft.title draft.slug draft.sections.id published.slug -_id")
      .sort({ "draft.title": 1 })
      .lean<PageRecord[]>(),
    Page.findOne({ key: "home" })
      .select("draft.sections.id published.page.status -_id")
      .lean<{
        draft?: { sections: unknown[] };
        published?: { page: { status: string } };
      }>(),
  ]);
  const pages = [
    {
      title: "Homepage",
      path: "/",
      edit: "/admin/cms",
      published: home?.published?.page.status === "published",
      count: home?.draft?.sections.length || 0,
    },
    ...rows.map((row) => ({
      title: row.draft.title,
      path: "/" + row.draft.slug,
      edit: "/admin/pages/" + row.draft.slug,
      published: !!row.published,
      count: row.draft.sections.length,
    })),
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Pages</h1>
          <p className="mt-2 text-sm text-muted">
            Choose a page to edit its content, sections and publishing settings.
          </p>
        </div>
        <Link href="/admin/pages/new" className="button min-h-10 py-2">
          <Plus size={16} /> Add page
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {pages.map((page) => (
          <Link
            key={page.path}
            href={page.edit}
            aria-label={"Edit " + page.title}
            className="panel lift-card flex min-h-[96px] items-center gap-2.5 p-3"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-softblue">
              <PanelsTopLeft size={17} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block break-words text-sm">
                {page.title}
              </strong>
              <span
                title={page.path}
                className="mt-1 block truncate text-xs text-muted"
              >
                {page.path}
              </span>
              <span className="block text-xs text-muted">
                {page.count} sections
              </span>
              <span className="mt-1 inline-block rounded-full bg-tint px-2 py-1 text-[11px] font-bold">
                {page.published ? "Published" : "Draft"}
              </span>
            </span>
            <ChevronRight
              size={16}
              className="shrink-0 text-muted"
              aria-hidden
            />
          </Link>
        ))}
      </div>
      <div className="panel mt-4 flex flex-wrap gap-x-5 gap-y-3 px-4 py-3 text-sm font-bold">
        {[
          ["Header & Navigation", "header"],
          ["Shared Footer", "footer"],
          ["Shared Red Banner", "banner"],
          ["Global SEO", "seo"],
          ["WhatsApp", "whatsapp"],
        ].map(([label, tab]) => (
          <Link
            key={tab}
            href={"/admin/cms?tab=" + tab}
            className="hover:underline"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
