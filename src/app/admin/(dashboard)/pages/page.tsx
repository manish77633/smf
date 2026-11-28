import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Plus } from "lucide-react";
import { adminEmail } from "@/auth";
import { connect } from "@/lib/db";
import { adminPages } from "@/lib/admin-pages";
import { dateLabel } from "@/lib/enquiry-admin";

export default async function Pages({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; q?: string }>;
}) {
  if (!(await adminEmail())) redirect("/admin/login");
  await connect();
  const [{ group, q }, entries] = await Promise.all([searchParams, adminPages()]);
  const loans = group === "loans";
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const pages = entries.filter((page) =>
    page.loan === loans &&
    [page.title, page.path].some((value) => value.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">{loans ? "Loan services" : "Pages"}</h1>
          {loans && (
            <p className="mt-2 text-sm text-muted">
              Edit service landing pages and the loan cards visitors use to find them.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {loans && (
            <Link href="/admin/cms?tab=loans" className="admin-quiet-action">
              Manage loan cards <ArrowUpRight size={15} aria-hidden />
            </Link>
          )}
          <Link href="/admin/pages/new" className="button">
            <Plus size={16} aria-hidden /> Add page
          </Link>
        </div>
      </div>
      <form className="mb-4 flex max-w-md gap-2" action="/admin/pages">
        {loans && <input name="group" type="hidden" value="loans" />}
        <input name="q" type="search" aria-label="Search by title or URL" placeholder="Search by title or URL" className="field" defaultValue={query} />
        <button className="admin-quiet-action">Search</button>
      </form>
      {pages.length ? (
        <div className="admin-list panel">
          <table>
            <thead>
              <tr>
                <th scope="col">Page</th>
                <th scope="col">Status</th>
                <th scope="col">Last published</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.path}>
                  <th scope="row">
                    <Link href={page.edit}>{page.title}</Link>
                    <small>{page.path} · {page.count} sections</small>
                  </th>
                  <td>
                    <span className="admin-status" data-live={page.published}>
                      {page.published ? "Published" : "Draft"}
                    </span>
                    {page.draftChanges && <small>Draft changes</small>}
                  </td>
                  <td>{page.publishedAt ? dateLabel(page.publishedAt) : "—"}</td>
                  <td>
                    <Link href={page.edit} className="admin-quiet-action" aria-label={"Edit " + page.title}>
                      Edit <ArrowUpRight size={14} aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="panel p-4 text-muted">{query ? "No matching pages." : "No pages yet."}</p>
      )}
    </div>
  );
}
