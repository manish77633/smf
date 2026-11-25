import "server-only";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import { connect, Page, SiteSettings, Navigation, ContentModels } from "./db";
import { draft, records } from "./seed-content";
import type { Site, EntityKey, Records } from "./content";
export const cacheTag = "published-home";
export async function getSite(): Promise<Site | null> {
  if (process.env.MONGODB_URI)
    return process.env.NODE_ENV === "development"
      ? readPublished()
      : published();
  if (process.env.NODE_ENV === "development") return { ...draft, records };
  return null;
}
async function readPublished(): Promise<Site | null> {
  await connect();
  const row = await Page.findOne({ key: "home" }).lean<{ published?: Site }>();
  return row?.published ?? null;
}
const published = unstable_cache(
  readPublished,
  [
    "published-home-v4",
    createHash("sha256")
      .update(process.env.MONGODB_URI || "")
      .digest("hex"),
  ],
  { tags: [cacheTag], revalidate: 300 },
);
export async function getDraft(): Promise<Site & { revision: number }> {
  const mongoose = await connect();
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(
      async () => {
        const page = await Page.findOne({ key: "home" })
          .session(session)
          .lean<{ draft: Pick<Site, "page" | "sections">; revision: number }>();
        const settings = await SiteSettings.findOne({ key: "global" })
          .session(session)
          .lean<{ value: Site["settings"] }>();
        const nav = await Navigation.findOne({ key: "home" })
          .session(session)
          .lean<{ value: Site["sections"] }>();
        if (!page || !settings || !nav)
          throw new Error("Seed the database before using the CMS");
        const pairs = [];
        for (const key of Object.keys(ContentModels) as EntityKey[]) {
          const items = await ContentModels[key]
            .find()
            .session(session)
            .lean<{ value: unknown }[]>();
          pairs.push([key, items.map((item) => item.value)]);
        }
        const collections = Object.fromEntries(pairs) as Records;
        return {
          ...page.draft,
          sections: page.draft.sections.map(
            (item) => nav.value.find((n) => n.id === item.id) ?? item,
          ),
          settings: settings.value,
          records: collections,
          revision: page.revision,
        };
      },
      { readConcern: { level: "snapshot" } },
    );
  } finally {
    await session.endSession();
  }
}
export function loanOptions(site: Site) {
  const loans = site.records.loans
    .filter((l) => l.visible)
    .sort((a, b) => a.order - b.order)
    .map((l) => ({ value: l.slug, label: l.title }));
  const custom =
    site.sections.find((s) => s.type === "contact")?.content.options || [];
  return [
    ...new Map(
      [...loans, ...custom].map((item) => [item.value, item]),
    ).values(),
  ];
}
