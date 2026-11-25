import type { ClientSession } from "mongoose";
import { Media } from "./db";
export async function protectPublishedMedia(
  content: unknown,
  session: ClientSession,
) {
  const urls =
    JSON.stringify(content).match(
      /https:\/\/res\.cloudinary\.com\/[^"\\]+|\/media\/[a-f0-9-]{36}(?=")/g,
    ) || [];
  for (const url of new Set(urls)) {
    const asset = await Media.updateOne(
      { url, deleting: { $ne: true } },
      { $inc: { __v: 1 } },
      { session },
    );
    if (!asset.matchedCount)
      throw Error("A published image is missing from the media library.");
  }
}
