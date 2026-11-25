"use server";
import { z } from "zod";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { adminEmail } from "@/auth";
import { connect, Page, AuditLog } from "@/lib/db";
import { editablePage } from "@/lib/pages";
import { protectPublishedMedia } from "@/lib/publish-media";
import { cleanRich } from "@/lib/rich";
const args = z.object({
  page: editablePage,
  revision: z.number().int().min(-1),
  mode: z.enum(["draft", "publish", "unpublish", "delete"]),
});
export async function editPage(input: unknown) {
  const email = await adminEmail();
  if (!email) return { ok: false as const, error: "Sign in to continue." };
  const result = args.safeParse(input);
  if (!result.success)
    return {
      ok: false as const,
      error: result.error.issues
        .map((issue) => issue.path.join(" › ") + ": " + issue.message)
        .join("\n"),
    };
  const { page, mode, revision } = result.data;
  const key = "page:" + page.slug;
  page.sections.forEach((block) => {
    block.body = cleanRich(block.body);
  });
  try {
    await connect();
    await Page.init();
    await mongoose.connection.transaction(async (session) => {
      if (mode === "delete") {
        if (
          !(await Page.deleteOne({ key, revision }, { session })).deletedCount
        )
          throw Error("Page changed. Reload before deleting.");
      } else {
        if (mode === "publish") await protectPublishedMedia(page, session);
        const set = {
          draft: page,
          ...(mode === "publish" ? { published: page } : {}),
        };
        if (revision === -1)
          await Page.create([{ key, ...set, revision: 0 }], { session });
        else if (
          !(
            await Page.updateOne(
              { key, revision },
              {
                $set: set,
                $inc: { revision: 1 },
                ...(mode === "unpublish" ? { $unset: { published: 1 } } : {}),
              },
              { session },
            )
          ).matchedCount
        )
          throw Error("Page changed. Reload before saving.");
      }
      await AuditLog.create(
        [{ actor: email, action: mode + "-page", target: key }],
        { session },
      );
    });
    revalidatePath("/" + page.slug);
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/pages");
    return { ok: true as const, revision: revision + 1 };
  } catch (error) {
    return {
      ok: false as const,
      error:
        (error as { code?: number }).code === 11000
          ? "This page URL is already in use."
          : error instanceof Error && error.name === "Error"
            ? error.message
            : "Could not update the page.",
    };
  }
}
