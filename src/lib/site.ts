import "server-only";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import type { PipelineStage } from "mongoose";
import { connect, Page, SiteSettings, Navigation, ContentModels } from "./db";
import { draft, records, homeHighlights } from "./seed-content";
import type { Site, EntityKey, Records } from "./content";
export const cacheTag = "published-home";
const bundledSite = {
  ...draft,
  records,
  settings: { ...draft.settings, index: false, follow: false },
  bundled: true as const,
};
export async function getSite(): Promise<(Site & { bundled?: true }) | null> {
  if (!process.env.MONGODB_URI) return bundledSite;
  const site = await (process.env.NODE_ENV === "development"
    ? readPublished()
    : published());
  return site === "unseeded" ? bundledSite : site && { ...site, sections: site.sections.map(withHighlights) };
}
function withHighlights(section: Site["sections"][number]): Site["sections"][number] {
  return section.type === "trust" && !section.content.homeHighlights
    ? { ...section, content: { ...section.content, homeHighlights } }
    : section;
}
async function readPublished(): Promise<Site | null | "unseeded"> {
  await connect();
  const row = await Page.findOne({ key: "home" }).lean<{ published?: Site }>();
  return row ? (row.published ?? null) : "unseeded";
}
const published = unstable_cache(
  readPublished,
  [
    "published-home-v9",
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
        const keys = Object.keys(ContentModels) as EntityKey[];
        const projection = { $project: { _id: 0, value: 1 } };
        const lookup = (
          from: string,
          as: string,
          key?: string,
        ): PipelineStage.Lookup => ({
          $lookup: {
            from,
            as,
            pipeline: key ? [{ $match: { key } }, projection] : [projection],
          },
        });
        type DraftRow = {
          draft: Pick<Site, "page" | "sections">;
          revision: number;
          settings: { value: Site["settings"] }[];
          navigation: { value: Site["sections"] }[];
        } & Record<EntityKey, { value: unknown }[]>;
        const [page] = await Page.aggregate<DraftRow>([
          { $match: { key: "home" } },
          { $project: { _id: 0, draft: 1, revision: 1 } },
          lookup(SiteSettings.collection.name, "settings", "global"),
          lookup(Navigation.collection.name, "navigation", "home"),
          ...keys.map((key) => lookup(ContentModels[key].collection.name, key)),
        ]).session(session);
        const settings = page?.settings[0]?.value;
        const navigation = page?.navigation[0]?.value;
        if (!page || !settings || !navigation)
          throw new Error("Seed the database before using the CMS");
        return {
          ...page.draft,
          sections: page.draft.sections.map(
            (item) => withHighlights(navigation.find((n) => n.id === item.id) ?? item),
          ),
          settings,
          records: Object.fromEntries(
            keys.map((key) => [key, page[key].map((item) => item.value)]),
          ) as Records,
          revision: page.revision ?? 0,
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
