import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import { z } from "zod";
import mongoose from "mongoose";
import {
  AdminUser,
  Page,
  SiteSettings,
  Navigation,
  ContentModels,
  connect,
} from "../src/lib/db";
import { draft, records } from "../src/lib/seed-content";
import { entities, type EntityKey, type Site } from "../src/lib/content";
import {
  businessLoanPage,
  contactPage,
  editablePage,
  loanPageFor,
  servicesPage,
} from "../src/lib/pages";
loadEnvConfig(process.cwd());
async function setup() {
  await connect();
  if (process.argv[2] === "seed") {
    await Promise.all(
      [Page, SiteSettings, Navigation, ...Object.values(ContentModels)].map(
        (model) => model.init(),
      ),
    );
    for (const entry of [servicesPage, contactPage, businessLoanPage]) {
      const page = editablePage.parse(entry);
      await Page.updateOne(
        { key: "page:" + page.slug },
        { $setOnInsert: { draft: page, published: page, revision: 0 } },
        { upsert: true },
      );
    }
    const session = await mongoose.startSession();
    try {
      const seeded = await session.withTransaction(async () => {
        if (await Page.exists({ key: "home" }).session(session)) {
          const item = { label: "Contact", url: "#contact" };
          const options = {
            session,
            arrayFilters: [
              { "header.type": "header" },
              { "item.label": item.label, "item.url": item.url },
            ],
          };
          const navigation = await Navigation.updateOne(
            { key: "home", "value.content.items": { $elemMatch: item } },
            {
              $set: { "value.$[header].content.items.$[item].url": "/contact" },
            },
            options,
          );
          const published = await Page.updateOne(
            {
              key: "home",
              "published.sections": {
                $elemMatch: {
                  type: "header",
                  "content.items": { $elemMatch: item },
                },
              },
            },
            {
              $set: {
                "published.sections.$[header].content.items.$[item].url":
                  "/contact",
              },
              $inc: { revision: 1 },
            },
            options,
          );
          const home = await Page.findOne({ key: "home" })
            .session(session)
            .lean<{
              draft: { sections: Site["sections"] };
              published?: Site;
            }>();
          const defaultFooter = draft.sections.find(
            (s) => s.type === "footer",
          )!.content;
          const upgradeFooter = (sections: Site["sections"]) =>
            sections.map((section) => {
              if (
                section.type !== "footer" ||
                section.content.note !== undefined
              )
                return section;
              const content = section.content;
              return {
                ...section,
                content: {
                  ...content,
                  logo:
                    content.logo.image === "/images/smf.svg"
                      ? defaultFooter.logo
                      : content.logo,
                  socials: content.socials.length
                    ? content.socials
                    : defaultFooter.socials,
                  legal: content.legal.length
                    ? content.legal
                    : defaultFooter.legal,
                  columns: content.columns.map((column) => ({
                    ...column,
                    links: column.links.map((link) => {
                      const match = records.loans.find(
                        (loan) =>
                          link.enquiry &&
                          link.url === "#" + loan.slug &&
                          link.label === loan.title,
                      );
                      return match
                        ? { ...link, url: "/" + match.slug, enquiry: false }
                        : link;
                    }),
                  })),
                  contactFields: [],
                  note: defaultFooter.note,
                  backToTop: true,
                },
              };
            });
          if (
            home &&
            [...home.draft.sections, ...(home.published?.sections || [])].some(
              (s) => s.type === "footer" && s.content.note === undefined,
            )
          ) {
            const publishedSections = home.published
              ? upgradeFooter(home.published.sections)
              : undefined;
            await Page.updateOne(
              { key: "home" },
              {
                $set: {
                  "draft.sections": upgradeFooter(home.draft.sections),
                  ...(publishedSections
                    ? { "published.sections": publishedSections }
                    : {}),
                },
                $inc: { revision: 1 },
              },
              { session },
            );
          }
          let draftChanged = Boolean(navigation.modifiedCount);
          let publicChanged = Boolean(published.modifiedCount);
          for (const loan of records.loans) {
            const previous = { label: loan.cta.label, url: "", enquiry: true };
            const draftLoan = await ContentModels.loans.updateOne(
              {
                key: loan.slug,
                "value.cta.label": previous.label,
                "value.cta.url": "",
                "value.cta.enquiry": true,
              },
              { $set: { "value.cta": loan.cta } },
              { session },
            );
            const publicLoan = await Page.updateOne(
              {
                key: "home",
                "published.records.loans": {
                  $elemMatch: {
                    slug: loan.slug,
                    "cta.label": previous.label,
                    "cta.url": "",
                    "cta.enquiry": true,
                  },
                },
              },
              {
                $set: { "published.records.loans.$.cta": loan.cta },
                $inc: { revision: 1 },
              },
              { session },
            );
            draftChanged ||= Boolean(draftLoan.modifiedCount);
            publicChanged ||= Boolean(publicLoan.modifiedCount);
          }
          if (draftChanged && !publicChanged)
            await Page.updateOne(
              { key: "home" },
              { $inc: { revision: 1 } },
              { session },
            );
          return false;
        }
        const page = {
          page: draft.page,
          sections: draft.sections.map((s) =>
            s.type === "header" ? { ...s, content: {} } : s,
          ),
        };
        const publicSections = draft.sections.map((s) =>
          s.type === "statistics"
            ? { ...s, content: { ...s.content, items: [] } }
            : s,
        );
        const publicRecords = Object.fromEntries(
          Object.entries(records).map(([key, items]) => [
            key,
            items.filter((i) => i.visible),
          ]),
        );
        await Page.create(
          [
            {
              key: "home",
              draft: page,
              published: {
                ...draft,
                sections: publicSections,
                records: publicRecords,
              },
            },
          ],
          { session },
        );
        await SiteSettings.create([{ key: "global", value: draft.settings }], {
          session,
        });
        await Navigation.create(
          [
            {
              key: "home",
              value: draft.sections.filter((s) => s.type === "header"),
            },
          ],
          { session },
        );
        for (const key of Object.keys(records) as EntityKey[]) {
          const items = records[key].map((value, index) => ({
            key: "slug" in value ? value.slug : String(index),
            value: entities[key].parse(value),
          }));
          if (items.length)
            await ContentModels[key].insertMany(items, { session });
        }
        return true;
      });
      const home = await Page.findOne({ key: "home" }).lean<{
        published?: Site;
      }>();
      for (const loan of home?.published?.records.loans || []) {
        if (!loan.visible || loan.slug === "business-loan") continue;
        const key = "page:" + loan.slug;
        const existing = await Page.findOne({ key }).lean<{
          revision: number;
          draft: { sections: { id: string }[] };
        }>();
        const page = editablePage.parse(loanPageFor(loan));
        if (!existing)
          await Page.updateOne(
            { key },
            { $setOnInsert: { draft: page, published: page, revision: 0 } },
            { upsert: true },
          );
        else if (
          existing.revision === 0 &&
          existing.draft.sections.map((s) => s.id.slice(-3)).join(",") ===
            "301,302,303,304,305"
        )
          await Page.updateOne(
            { key, revision: 0, "draft.sections.5": { $exists: false } },
            { $set: { draft: page, published: page }, $inc: { revision: 1 } },
          );
      }
      console.log(
        seeded ? "Homepage seed applied." : "Homepage is already seeded.",
      );
    } finally {
      await session.endSession();
    }
  } else if (process.argv[2] === "admin") {
    const email = z.email().parse(process.env.ADMIN_EMAIL?.toLowerCase());
    const password = z
      .string()
      .min(
        process.env.SMF_LOCAL_BOOTSTRAP === "1" &&
          /^mongodb:\/\/127\.0\.0\.1:/.test(process.env.MONGODB_URI || "")
          ? 10
          : 14,
      )
      .refine((v) => Buffer.byteLength(v) <= 72, "Password exceeds 72 bytes")
      .parse(process.env.ADMIN_INITIAL_PASSWORD);
    await AdminUser.init();
    const result = await AdminUser.updateOne(
      { email },
      { $setOnInsert: { hash: await bcrypt.hash(password, 12), version: 0 } },
      { upsert: true },
    );
    console.log(
      result.upsertedCount
        ? "Administrator created."
        : "Administrator already exists.",
    );
  } else throw new Error("Specify seed or admin");
}
setup()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Setup failed");
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
