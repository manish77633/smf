"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { adminEmail, signOut } from "@/auth";
import { saveSite } from "@/lib/cms";
import {
  connect,
  AdminUser,
  AuditLog,
  Enquiry,
  Media,
  MediaBlob,
  Page,
} from "@/lib/db";
import { statuses } from "@/lib/content";
import { cloud } from "@/lib/media";
import { limited } from "@/lib/security";
import mongoose from "mongoose";
export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
async function actor() {
  const email = await adminEmail();
  if (!email) throw new Error("Sign in to continue.");
  await connect();
  return email;
}
export async function saveContent(doc: unknown, publish: boolean) {
  try {
    const email = await actor();
    const revision = await saveSite(doc, publish, email);
    revalidatePath("/admin", "layout");
    return { ok: true as const, revision };
  } catch (error) {
    console.error(
      "CMS save failed",
      error instanceof Error ? error.name : "unknown",
    );
    return {
      ok: false as const,
      message:
        error instanceof z.ZodError
          ? error.issues[0].path.join(" › ") + " — " + error.issues[0].message
          : error instanceof Error && error.name === "Error"
            ? error.message
            : "Could not save content.",
    };
  }
}
export async function updateEnquiry(form: FormData) {
  const email = await actor();
  const id = z
    .string()
    .regex(/^[0-9a-f]{24}$/)
    .parse(form.get("id"));
  const action = form.get("action") === "delete" ? "delete" : "update";
  if (action === "delete") await Enquiry.deleteOne({ _id: id });
  else
    await Enquiry.updateOne(
      { _id: id },
      {
        $set: {
          status: z.enum(statuses).parse(form.get("status")),
          notes: z.string().max(4000).parse(form.get("notes")),
        },
      },
    );
  await AuditLog.create({
    actor: email,
    action: action + "-enquiry",
    target: id,
  });
  revalidatePath("/admin/enquiries");
}
export async function changePassword(form: FormData) {
  const email = await actor();
  if (await limited("admin-password", email, 8, 900000))
    redirect("/admin/account?error=current");
  const current = String(form.get("current") || "");
  const next = String(form.get("next") || "");
  const target = await AdminUser.findOne({ email });
  if (
    !target ||
    Buffer.byteLength(current) > 72 ||
    !(await bcrypt.compare(current, target.hash))
  )
    redirect("/admin/account?error=current");
  if (
    next.length < 14 ||
    Buffer.byteLength(next) > 72 ||
    next !== form.get("confirm")
  )
    redirect("/admin/account?error=password");
  const result = await AdminUser.updateOne(
    { _id: target._id, version: target.version },
    { $set: { hash: await bcrypt.hash(next, 12) }, $inc: { version: 1 } },
  );
  if (!result.modifiedCount) redirect("/admin/account?error=current");
  await AuditLog.create({
    actor: email,
    action: "change-password",
    target: String(target._id),
  });
  await logout();
}
export async function updateMedia(form: FormData) {
  const email = await actor();
  const id = z
    .string()
    .regex(/^[0-9a-f]{24}$/)
    .parse(form.get("id"));
  if (form.get("action") !== "delete") {
    await Media.updateOne(
      { _id: id },
      { $set: { alt: z.string().max(240).parse(form.get("alt")) } },
    );
    await AuditLog.create({ actor: email, action: "edit-media", target: id });
    revalidatePath("/admin/media");
    return;
  }
  const asset = await Media.findById(id);
  if (!asset) return;
  const session = await mongoose.startSession();
  try {
    const removed = await session.withTransaction(async () => {
      const page = await Page.findOneAndUpdate(
        { key: "home" },
        { $inc: { revision: 1 } },
        { session },
      );
      const otherPages = await Page.find({
        key: /^page:/,
        published: { $exists: true },
      })
        .select("published")
        .session(session)
        .lean();
      if (
        JSON.stringify([
          page?.published,
          ...otherPages.map((p) => p.published),
        ]).includes(JSON.stringify(asset.url))
      )
        return false;
      await Media.updateOne(
        { _id: id },
        { $set: { deleting: true } },
        { session },
      );
      return true;
    });
    if (!removed) redirect("/admin/media?error=in-use");
  } finally {
    await session.endSession();
  }
  try {
    if (!asset.url.startsWith("/media/")) {
      const result = await cloud().uploader.destroy(asset.publicId, {
        invalidate: true,
      });
      if (!["ok", "not found"].includes(result.result))
        throw new Error("Cloudinary did not confirm deletion.");
    }
  } catch {
    redirect("/admin/media?error=cloud");
  }
  await mongoose.connection.transaction(async (session) => {
    await Media.deleteOne({ _id: id, deleting: true }, { session });
    if (asset.url.startsWith("/media/"))
      await MediaBlob.deleteOne({ publicId: asset.publicId }, { session });
    await AuditLog.create(
      [{ actor: email, action: "delete-media", target: id }],
      { session },
    );
  });
  revalidatePath("/admin/media");
}
