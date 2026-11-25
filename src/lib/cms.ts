import "server-only";
import { z } from "zod";
import mongoose from "mongoose";
import { updateTag } from "next/cache";
import {
  AuditLog,
  ContentModels,
  Navigation,
  Page,
  SiteSettings,
  Redirect,
} from "./db";
import {
  entities,
  globals,
  pageFields,
  sections,
  youtubeId,
  sampleVideo,
  type Section,
  type Site,
  type SectionKey,
  type EntityKey,
  type Records,
} from "./content";
import { cacheTag } from "./site";
import { cleanRich } from "./rich";
import { editablePage, loanPageFor } from "./pages";
import { protectPublishedMedia } from "./publish-media";
import { revalidatePath } from "next/cache";
const sectionType = z.enum(
  Object.keys(sections) as [SectionKey, ...SectionKey[]],
);
const sectionEnvelope = z.object({
  id: sectionType,
  type: sectionType,
  label: z.string().min(1).max(100),
  visible: z.boolean(),
  content: z.unknown(),
});
const request = z.object({
  page: pageFields,
  settings: globals,
  sections: z.array(sectionEnvelope).length(Object.keys(sections).length),
  records: z.record(z.string(), z.array(z.unknown()).max(200)),
  revision: z.number().int().min(0),
});
export function validateSite(doc: unknown) {
  const parsed = request.parse(doc);
  if (
    new Set(parsed.sections.map((s) => s.id)).size !== parsed.sections.length ||
    parsed.sections.some((s) => s.type !== s.id)
  )
    throw new Error("Each section must appear exactly once.");
  const items = parsed.sections.map((s) => {
    const content = sections[s.type].parse(s.content);
    if ("body" in content && typeof content.body === "string")
      content.body = cleanRich(content.body);
    return { ...s, content } as Section;
  });
  const records = Object.fromEntries(
    (Object.keys(entities) as EntityKey[]).map((key) => [
      key,
      (parsed.records[key] || []).map((value) => entities[key].parse(value)),
    ]),
  ) as Records;
  for (const key of ["loans", "blogs", "testimonials"] as const) {
    if (new Set(records[key].map((i) => i.slug)).size !== records[key].length)
      throw new Error("Each " + key + " slug must be unique.");
  }
  for (const article of records.blogs) {
    if (article.date && !/^\d{4}-\d{2}-\d{2}$/.test(article.date))
      throw new Error("Use YYYY-MM-DD for article dates.");
    article.body = cleanRich(article.body);
  }
  const redirects = parsed.settings.redirects;
  const sources = new Set(redirects.map((r) => r.from));
  if (
    sources.size !== redirects.length ||
    redirects.some(
      (r) =>
        !r.to ||
        sources.has(r.to.split("#")[0]) ||
        /^\/(?:api|admin)(?:\/|$)/.test(r.from),
    )
  )
    throw new Error(
      "Redirects must use unique public paths and cannot point to another redirect.",
    );
  if (
    parsed.settings.baseUrl &&
    !/^https?:\/\/[^/]+\/?$/.test(parsed.settings.baseUrl)
  )
    throw new Error("Enter a website origin without a page path.");
  return { ...parsed, sections: items, records };
}
export async function saveSite(
  document: unknown,
  publish: boolean,
  actor: string,
) {
  const { revision, ...draft } = validateSite(document);
  const s = draft.sections.find((s) => s.type === "statistics");
  if (publish) {
    if (s?.visible && s.content.items.some((i) => i.visible && !i.verified))
      throw new Error(
        "Verify or hide every visible statistic before publishing.",
      );
    if (
      draft.records.testimonials.some(
        (i) => i.visible && !i.example && !i.consent,
      )
    )
      throw new Error(
        "Confirm consent or hide each testimonial before publishing.",
      );
    if (
      draft.records.videos.some(
        (i) => i.visible && !sampleVideo(i.youtube) && !youtubeId(i.youtube),
      )
    )
      throw new Error(
        "Add a valid YouTube URL, select a bundled sample, or hide the video.",
      );
  }
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const nav = draft.sections.filter((s) => s.type === "header");
      const pageSections = draft.sections.map((s) =>
        s.type === "header" ? { ...s, content: {} } : s,
      );
      const published = publish
        ? ({
            ...draft,
            records: Object.fromEntries(
              Object.entries(draft.records).map(([key, values]) => [
                key,
                values.filter((item) => item.visible),
              ]),
            ),
            sections: draft.sections.map((s) => {
              if (s.type === "statistics")
                return {
                  ...s,
                  content: {
                    ...s.content,
                    items: s.content.items.filter(
                      (i) => i.visible && i.verified,
                    ),
                  },
                };
              return s;
            }),
          } as Site)
        : undefined;
      const result = await Page.updateOne(
        { key: "home", revision },
        {
          $set: {
            draft: { page: draft.page, sections: pageSections },
            ...(published ? { published } : {}),
          },
          $inc: { revision: 1 },
        },
        { session },
      );
      if (!result.matchedCount)
        throw new Error(
          "The homepage changed in another session. Reload to edit the latest draft.",
        );
      await SiteSettings.updateOne(
        { key: "global" },
        { $set: { value: draft.settings } },
        { session, upsert: true },
      );
      await Navigation.updateOne(
        { key: "home" },
        { $set: { value: nav } },
        { session, upsert: true },
      );
      for (const key of Object.keys(ContentModels) as EntityKey[]) {
        const model = ContentModels[key];
        const rows = draft.records[key].map((value, index) => ({
          key: "slug" in value ? value.slug : String(index),
          value,
        }));
        await model.deleteMany(
          { key: { $nin: rows.map((r) => r.key) } },
          { session },
        );
        if (rows.length)
          await model.bulkWrite(
            rows.map((row) => ({
              updateOne: {
                filter: { key: row.key },
                update: { $set: { value: row.value } },
                upsert: true,
              },
            })),
            { session },
          );
      }
      if (published) {
        await protectPublishedMedia(published, session);
        for (const loan of published.records.loans) {
          const key = "page:" + loan.slug;
          if (await Page.exists({ key }).session(session)) continue;
          const page = editablePage.parse(loanPageFor(loan));
          await Page.create(
            [{ key, draft: page, published: page, revision: 0 }],
            { session },
          );
        }
        await Redirect.deleteMany(
          { from: { $nin: draft.settings.redirects.map((r) => r.from) } },
          { session },
        );
        if (draft.settings.redirects.length)
          await Redirect.bulkWrite(
            draft.settings.redirects.map((value) => ({
              updateOne: {
                filter: { from: value.from },
                update: { $set: value },
                upsert: true,
              },
            })),
            { session },
          );
      }
      await AuditLog.create(
        [
          {
            actor,
            action: publish ? "publish-home" : "save-home-draft",
            target: "home",
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  if (publish) {
    updateTag(cacheTag);
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/pages");
  }
  return revision + 1;
}
