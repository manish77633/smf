import Link from "next/link";
import { redirect } from "next/navigation";
import { adminEmail } from "@/auth";
import { connect, Enquiry } from "@/lib/db";
import { statuses } from "@/lib/content";
import {
  dateLabel,
  enquiryFilter,
  type Filters,
  type Row,
} from "@/lib/enquiry-admin";
import { ActionForm, Submit } from "@/components/admin-actions";
import { updateEnquiry } from "../../actions";
const size = 20;
export default async function Enquiries({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  if (!(await adminEmail())) redirect("/admin/login");
  await connect();
  const params = await searchParams,
    filter = enquiryFilter(params);
  const [count, loans] = await Promise.all([
    Enquiry.countDocuments(filter),
    Enquiry.distinct("loan"),
  ]);
  const page = Math.max(
    1,
    Math.min(Math.ceil(count / size), Math.floor(Number(params.page) || 1)),
  );
  const rows = await Enquiry.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * size)
    .limit(size)
    .lean<Row[]>();
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([key, value]) => key !== "page" && typeof value === "string",
    ),
  );
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Enquiries</h1>
        <a
          className="button min-h-0 py-2"
          href={"/api/admin/enquiries?" + query}
        >
          Export filtered CSV
        </a>
      </div>
      <form className="panel mb-5 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-6">
        <label className="text-xs font-bold">
          Search
          <input
            className="field mt-1"
            name="q"
            defaultValue={params.q}
            placeholder="Name, email or phone"
          />
        </label>
        <label className="text-xs font-bold">
          Status
          <select
            className="field mt-1"
            name="status"
            defaultValue={params.status || ""}
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold">
          Loan
          <select
            className="field mt-1"
            name="loan"
            defaultValue={params.loan || ""}
          >
            <option value="">All loans</option>
            {loans.map((loan) => (
              <option key={loan}>{loan}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold">
          From
          <input
            className="field mt-1"
            type="date"
            name="from"
            defaultValue={params.from}
          />
        </label>
        <label className="text-xs font-bold">
          To
          <input
            className="field mt-1"
            type="date"
            name="to"
            defaultValue={params.to}
          />
        </label>
        <button className="button self-end">Apply filters</button>
      </form>
      <section className="panel p-4">
        <p className="mb-4 text-sm text-muted">{count} enquiries</p>
        {rows.length ? (
          rows.map((r) => (
            <details key={String(r._id)} className="border-t border-rule py-3">
              <summary className="text-sm font-extrabold">
                <span>{r.name}</span>
                <span className="ml-3 rounded-full bg-softblue px-2 py-1 text-xs">
                  {r.status}
                </span>
                <span className="ml-3 text-xs font-normal text-muted">
                  {r.loan} · {dateLabel(r.createdAt)}
                </span>
              </summary>
              <div className="mt-4 grid gap-5 p-3 md:grid-cols-2">
                <dl className="grid gap-x-2 gap-y-2 text-sm sm:grid-cols-[auto_1fr] [&_dt]:font-extrabold">
                  <dt>Reference</dt>
                  <dd>{String(r._id)}</dd>
                  <dt>Phone</dt>
                  <dd>
                    <a className="underline" href={"tel:+91" + r.phone}>
                      {r.phone}
                    </a>{" "}
                    ·{" "}
                    <a
                      href={"https://wa.me/91" + r.phone}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      WhatsApp
                    </a>
                  </dd>
                  <dt>Email</dt>
                  <dd>
                    {r.email ? (
                      <a
                        className="break-all underline"
                        href={"mailto:" + r.email}
                      >
                        {r.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                  <dt>Message</dt>
                  <dd className="break-words whitespace-pre-wrap">
                    {r.message || "—"}
                  </dd>
                  <dt>Source</dt>
                  <dd>
                    {r.source} · {r.sourcePage}
                  </dd>
                  <dt>Consent</dt>
                  <dd>{dateLabel(r.consentAt)}</dd>
                  <dt>Email notification</dt>
                  <dd>{r.notification}</dd>
                </dl>
                <ActionForm className="grid gap-3" action={updateEnquiry}>
                  <input type="hidden" name="id" value={String(r._id)} />
                  <label className="grid gap-1 text-xs font-bold">
                    Status
                    <select
                      className="field"
                      name="status"
                      defaultValue={r.status}
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-bold">
                    Internal notes
                    <textarea
                      className="field min-h-24"
                      name="notes"
                      defaultValue={r.notes}
                      maxLength={4000}
                    />
                  </label>
                  <div className="flex gap-2">
                    <Submit>Save enquiry</Submit>
                  </div>
                </ActionForm>
                <ActionForm action={updateEnquiry} message="Enquiry deleted">
                  <input type="hidden" name="id" value={String(r._id)} />
                  <input type="hidden" name="action" value="delete" />
                  <Submit danger confirmText="Permanently delete this enquiry?">
                    Delete enquiry
                  </Submit>
                </ActionForm>
              </div>
            </details>
          ))
        ) : (
          <p className="text-sm text-muted">
            No enquiries match these filters.
          </p>
        )}
      </section>
      <nav
        aria-label="Enquiry pages"
        className="mt-4 flex gap-4 text-sm font-bold"
      >
        {page > 1 && (
          <Link
            href={
              "?" +
              new URLSearchParams({
                ...Object.fromEntries(query),
                page: String(page - 1),
              })
            }
          >
            Previous
          </Link>
        )}
        <span>Page {page}</span>
        {page * size < count && (
          <Link
            href={
              "?" +
              new URLSearchParams({
                ...Object.fromEntries(query),
                page: String(page + 1),
              })
            }
          >
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}
