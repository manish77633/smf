import { createHash } from "node:crypto";
import { RateLimit } from "./db";
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const clientIp = (headers: Headers) =>
  headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "local";
export async function limited(
  scope: string,
  key: string,
  limit: number,
  windowMs: number,
) {
  const start = Math.floor(Date.now() / windowMs) * windowMs;
  const id = digest(scope + ":" + key + ":" + start);
  try {
    const row = await RateLimit.findOneAndUpdate(
      { _id: id },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(start + windowMs) },
      },
      { upsert: true, new: true },
    );
    return row!.count > limit;
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    const row = await RateLimit.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 } },
      { new: true },
    );
    return !row || row.count > limit;
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const target = process.env.AUTH_URL || request.url;
  return origin === new URL(target).origin;
}
