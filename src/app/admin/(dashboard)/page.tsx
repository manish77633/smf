import { redirect } from "next/navigation";
import Link from "next/link";
import { adminEmail } from "@/auth";
import { connect, Enquiry } from "@/lib/db";
import { getSite } from "@/lib/site";
import { dateLabel, type Row } from "@/lib/enquiry-admin";
export default async function Overview() {
  if (!(await adminEmail())) redirect("/admin/login");
  await connect();
  const now = new Date();
  const weeks = Array.from(
    { length: 6 },
    (_, i) => new Date(now.getTime() - (6 - i) * 7 * 86400000),
  );
  const [total, fresh, contacted, site, recent, byLoan, trend] =
    await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: "New" }),
      Enquiry.countDocuments({ status: "Contacted" }),
      getSite(),
      Enquiry.find().sort({ createdAt: -1 }).limit(6).lean<Row[]>(),
      Enquiry.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$loan", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]),
      Enquiry.aggregate<{ _id: Date; count: number }>([
        { $match: { createdAt: { $gte: weeks[0] } } },
        {
          $bucket: {
            groupBy: "$createdAt",
            boundaries: [...weeks, new Date(+now + 1)],
            default: "other",
            output: { count: { $sum: 1 } },
          },
        },
      ]),
    ]);
  const live = site?.page.status === "published" ? site.records : undefined;
  const cards = [
    ["Total enquiries", total],
    ["New enquiries", fresh],
    ["Contacted enquiries", contacted],
    ["Published loans", live?.loans.length || 0],
    [
      "Published articles",
      live?.blogs.filter(
        (b) => !b.date || b.date <= now.toISOString().slice(0, 10),
      ).length || 0,
    ],
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <p className="mb-2 text-xs font-bold text-muted">Admin / Overview</p>
      <h1 className="mb-6 text-3xl font-extrabold">Overview</h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <div className="panel p-4" key={label}>
            <p className="text-xs font-bold text-muted">{label}</p>
            <p className="mt-2 text-3xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>
      <div className="my-5 grid gap-5 md:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-4 text-lg font-extrabold">Enquiry trends</h2>
          <ul className="grid gap-2">
            {weeks.map((date) => {
              const count = trend.find((t) => +t._id === +date)?.count || 0;
              return (
                <li
                  key={date.toISOString()}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="w-24 shrink-0">
                    {date.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      timeZone: "Asia/Kolkata",
                    })}
                  </span>
                  <meter
                    className="w-full"
                    aria-label={
                      "Enquiries in week starting " + date.toDateString()
                    }
                    min={0}
                    max={Math.max(1, ...trend.map((x) => x.count))}
                    value={count}
                  />
                  <strong>{count}</strong>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="panel p-5">
          <h2 className="mb-4 text-lg font-extrabold">
            Enquiries by loan type
          </h2>
          {byLoan.length ? (
            <ul className="grid gap-2">
              {byLoan.map((item) => (
                <li className="flex justify-between text-sm" key={item._id}>
                  {live?.loans.find((l) => l.slug === item._id)?.title ||
                    item._id}
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No enquiries yet.</p>
          )}
        </section>
      </div>
      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Recent enquiries</h2>
          <Link href="/admin/enquiries" className="text-sm font-bold underline">
            View all
          </Link>
        </div>
        {recent.length ? (
          <ul className="divide-y divide-rule">
            {recent.map((row) => (
              <li
                key={String(row._id)}
                className="flex flex-wrap justify-between gap-2 py-3 text-sm"
              >
                <strong>{row.name}</strong>
                <span>{row.loan}</span>
                <span>{row.status}</span>
                <time>{dateLabel(row.createdAt)}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No enquiries yet.</p>
        )}
      </section>
    </div>
  );
}
