import "server-only";
import { cache } from "react";
import { connect, Page } from "./db";
import {
  businessLoanPage,
  contactPage,
  servicesPage,
  type EditablePage,
} from "./pages";
export type PageRecord = {
  draft: EditablePage;
  published?: EditablePage;
  revision: number;
};
export const publicPage = cache(
  async (slug: string): Promise<EditablePage | null> => {
    if (!process.env.MONGODB_URI)
      return process.env.NODE_ENV === "development"
        ? [servicesPage, contactPage, businessLoanPage].find(
            (page) => page.slug === slug,
          ) || null
        : null;
    await connect();
    const row = await Page.findOne({ key: "page:" + slug })
      .select("published -_id")
      .lean<Pick<PageRecord, "published">>();
    return row?.published || null;
  },
);
export async function publishedPages() {
  if (!process.env.MONGODB_URI) return [];
  await connect();
  return Page.find({ key: /^page:/, published: { $exists: true } })
    .select("published -_id")
    .lean<{ published: EditablePage }[]>();
}
