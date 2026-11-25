import { connect, Media, MediaBlob } from "@/lib/db";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id) || !process.env.MONGODB_URI)
    return new Response(null, { status: 404 });
  await connect();
  const asset = await Media.exists({
    url: "/media/" + id,
    deleting: { $ne: true },
  });
  if (!asset) return new Response(null, { status: 404 });
  const blob = await MediaBlob.findOne({ publicId: id });
  if (!blob?.data) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(blob.data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
