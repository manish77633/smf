import type { QueryFilter } from "mongoose";
import { statuses } from "./content";
export type Filters = {
  q?: string;
  status?: string;
  loan?: string;
  from?: string;
  to?: string;
  page?: string;
};
export type Row = {
  _id: unknown;
  name: string;
  phone: string;
  email?: string;
  loan: string;
  message?: string;
  source: string;
  sourcePage: string;
  consentAt: Date;
  createdAt: Date;
  status: (typeof statuses)[number];
  notes: string;
  notification: string;
};
export function enquiryFilter(params: Filters): QueryFilter<Row> {
  const filter: QueryFilter<Row> = {};
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  if (q) {
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: re }, { email: re }, { phone: re }];
  }
  const status = statuses.find((s) => s === params.status);
  if (status) filter.status = status;
  if (
    typeof params.loan === "string" &&
    params.loan.length &&
    params.loan.length < 121
  )
    filter.loan = params.loan;
  const date = (value?: string) =>
    value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value))
      ? new Date(value + "T00:00:00+05:30")
      : null;
  const from = date(params.from),
    to = date(params.to);
  if (from || to)
    filter.createdAt = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lt: new Date(+to + 86400000) } : {}),
    };
  return filter;
}
export function csvCell(value: unknown) {
  const text = String(value ?? "");
  return (
    '"' +
    (/^[\s]*[=+@-]|^[\t\r]/.test(text) ? "'" : "") +
    text.replaceAll('"', '""') +
    '"'
  );
}
export const dateLabel = (value: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(value);
