import "server-only";
import { cache } from "react";
import { connect, Page } from "./db";
import {
  businessLoanPage,
  contactPage,
  loanPageFor,
  servicesPage,
  type EditablePage,
} from "./pages";
import { records } from "./seed-content";
import { getSite } from "./site";
export type PageRecord = {
  draft: EditablePage;
  published?: EditablePage;
  revision: number;
};
export const publicPage = cache(
  async (slug: string): Promise<EditablePage | null> => {
    if (process.env.MONGODB_URI) {
      await connect();
      const row = await Page.findOne({ key: "page:" + slug })
        .select("published -_id")
        .lean<Pick<PageRecord, "published">>();
      if (row || !(await getSite())?.bundled) return row?.published ?? null;
    }
    const page = [servicesPage, contactPage, businessLoanPage].find(
      (page) => page.slug === slug,
    );
    const loan = records.loans.find(
      (item) => item.visible && item.slug === slug,
    );
    return page ?? (loan ? loanPageFor(loan) : null);
  },
);
export async function publishedPages() {
  if (!process.env.MONGODB_URI) return [];
  await connect();
  return Page.find({ key: /^page:/, published: { $exists: true } })
    .select("published -_id")
    .lean<{ published: EditablePage }[]>();
}
