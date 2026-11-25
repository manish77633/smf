import { adminEmail } from "@/auth";
import { AuditLog, Media, MediaBlob, connect } from "@/lib/db";
import { cloud } from "@/lib/media";
import { sameOrigin } from "@/lib/security";
import type { UploadApiResponse } from "cloudinary";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { message: "Invalid request origin." },
      { status: 403 },
    );
  const actor = await adminEmail();
  if (!actor)
    return Response.json({ message: "Sign in to upload." }, { status: 401 });
  const max = 4 * 1024 * 1024;
  const size = Number(request.headers.get("content-length"));
  if (!size || size > max + 32000)
    return Response.json(
      { message: "Choose an image under 4 MB." },
      { status: 413 },
    );
  try {
    const form = await request.formData(),
      file = form.get("file"),
      alt = String(form.get("alt") || "");
    if (
      !(file instanceof File) ||
      !file.size ||
      file.size > max ||
      alt.length > 240
    )
      return Response.json(
        { message: "Invalid size or alt text." },
        { status: 400 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const png = bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const webp =
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP";
    if (!jpeg && !png && !webp)
      return Response.json(
        { message: "Use JPEG, PNG or WebP." },
        { status: 400 },
      );
    const mongoose = await connect();
    if (
      !process.env.CLOUDINARY_CLOUD_NAME &&
      !process.env.CLOUDINARY_API_KEY &&
      !process.env.CLOUDINARY_API_SECRET
    ) {
      let image;
      try {
        image = await sharp(bytes, { limitInputPixels: 25_000_000 })
          .rotate()
          .resize({
            width: 2400,
            height: 2400,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 86 })
          .toBuffer({ resolveWithObject: true });
      } catch {
        return Response.json(
          { message: "The image could not be decoded." },
          { status: 400 },
        );
      }
      const publicId = randomUUID(),
        url = "/media/" + publicId;
      await mongoose.connection.transaction(async (session) => {
        await Media.create(
          [
            {
              publicId,
              url,
              format: "webp",
              width: image.info.width,
              height: image.info.height,
              bytes: image.data.length,
              alt,
            },
          ],
          { session },
        );
        await MediaBlob.create([{ publicId, data: image.data }], { session });
        await AuditLog.create(
          [
            {
              actor,
              action: "upload-media",
              target: publicId,
            },
          ],
          { session },
        );
      });
      return Response.json({ url, alt }, { status: 201 });
    }
    const uploader = cloud().uploader;
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      uploader
        .upload_stream(
          {
            folder: "smf",
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            overwrite: false,
          },
          (error, result) =>
            error || !result ? reject(error) : resolve(result),
        )
        .end(bytes);
    });
    try {
      await Media.create({
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        alt,
      });
    } catch (error) {
      await uploader.destroy(result.public_id).catch(() => {});
      throw error;
    }
    await AuditLog.create({
      actor,
      action: "upload-media",
      target: result.public_id,
    });
    return Response.json({ url: result.secure_url, alt }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error &&
          error.message === "Cloudinary is not configured."
            ? error.message
            : "Upload failed. Check Cloudinary configuration and try again.",
      },
      { status: 503 },
    );
  }
}
