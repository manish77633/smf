"use server";

import mongoose from "mongoose";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { adminEmail } from "@/auth";
import { seo, slug } from "@/lib/content";
import { AuditLog, connect, Page, SiteSettings } from "@/lib/db";
import { canonicalUrl } from "@/lib/metadata";
import { protectPublishedMedia } from "@/lib/publish-media";
import { seoSettings } from "@/lib/seo-settings";
import { cacheTag } from "@/lib/site";

const common = {
  revision: z.number().int().nonnegative(),
  publish: z.boolean(),
};
const request = z.discriminatedUnion("target", [
  z.object({ ...common, target: z.literal("site"), value: seoSettings }),
  z.object({ ...common, target: z.literal("home"), value: seo }),
  z.object({ ...common, target: z.literal("page"), slug, value: seo }),
]);

export async function saveSeo(input: unknown) {
  const email = await adminEmail();
  if (!email) return { ok: false as const, error: "Sign in to continue." };
  const parsed = request.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false as const, error: issue.message };
  }
  const { data } = parsed;
  const key = data.target === "page" ? "page:" + data.slug : "home";
  const path = data.target === "page" ? "/" + data.slug : "/";
  try {
    if (data.target === "site") {
      const origin = data.value.baseUrl;
      if (origin && (!/^https?:\/\/[^/]+\/?$/.test(origin) || !canonicalUrl(origin, "", "")))
        throw new Error("Enter a website origin without a page path.");
    } else if (data.value.canonical && !canonicalUrl(data.value.canonical, "", "")) {
      throw new Error("Enter a site path or an absolute web URL without a fragment.");
    }
    await connect();
    await mongoose.connection.transaction(async (session) => {
      const filter = { key, revision: data.revision };
      const live = data.publish
        ? {
            published: { $exists: true },
            ...(data.target === "home" ? { "published.page.status": "published" } : {}),
          }
        : {};
      if (data.publish) await protectPublishedMedia(data.value, session);
      const fields: Record<string, unknown> = {};
      if (data.target === "site") {
        const draft = Object.fromEntries(
          Object.entries(data.value).map(([field, value]) => ["value." + field, value]),
        );
        const result = await SiteSettings.updateOne({ key: "global" }, { $set: draft }, { session });
        if (!result.matchedCount) throw new Error("Seed the site settings before saving.");
        if (data.publish) {
          for (const [field, value] of Object.entries(data.value))
            fields["published.settings." + field] = value;
        }
      } else {
        const prefix = data.target === "home" ? "page.seo" : "seo";
        fields["draft." + prefix] = data.value;
        if (data.publish) fields["published." + prefix] = data.value;
      }
      const result = await Page.updateOne(
        { ...filter, ...live },
        { $set: fields, $inc: { revision: 1 } },
        { session },
      );
      if (!result.matchedCount)
        throw new Error("The page or its publishing status changed. Reload before saving.");
      await AuditLog.create(
        [{ actor: email, action: data.publish ? "publish-seo" : "save-seo-draft", target: key }],
        { session },
      );
    });
    if (data.publish) {
      if (key === "home") updateTag(cacheTag);
      if (data.target === "site") revalidatePath("/", "layout");
      else revalidatePath(path);
      revalidatePath("/sitemap.xml");
      revalidatePath("/robots.txt");
    }
    revalidatePath("/admin", "layout");
    return { ok: true as const, revision: data.revision + 1 };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error && error.name === "Error" ? error.message : "Could not save SEO.",
    };
  }
}
