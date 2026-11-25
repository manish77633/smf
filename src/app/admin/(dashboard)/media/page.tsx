import { bundledMedia } from "@/lib/bundled-media";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminEmail } from "@/auth";
import { connect, Media } from "@/lib/db";
import Upload from "@/components/upload";
import { ActionForm, Copy, Submit } from "@/components/admin-actions";
import { updateMedia } from "../../actions";
type Asset = {
  _id: unknown;
  url: string;
  alt: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  createdAt: Date;
};
export default async function Library({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; error?: string }>;
}) {
  if (!(await adminEmail())) redirect("/admin/login");
  await connect();
  const p = await searchParams,
    q = typeof p.q === "string" ? p.q.slice(0, 100) : "";
  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const filter = q ? { $or: [{ alt: regex }, { publicId: regex }] } : {};
  const total = await Media.countDocuments(filter),
    page = Math.max(
      1,
      Math.min(Math.ceil(total / 18), Math.floor(Number(p.page) || 1)),
    );
  const rows = await Media.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * 18)
    .limit(18)
    .lean<Asset[]>();
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 text-3xl font-extrabold">Media Library</h1>
      <Upload />
      {p.error && (
        <p role="alert" className="my-3 text-brand">
          {p.error === "in-use"
            ? "Replace this image in published content before deleting it."
            : "Cloudinary did not confirm removal. Retry deleting the image."}
        </p>
      )}
      <form className="my-5 flex max-w-lg gap-2">
        <input
          name="q"
          aria-label="Search images"
          className="field"
          placeholder="Search images"
          defaultValue={q}
        />
        <button className="button">Search</button>
      </form>
      {page === 1 &&
        bundledMedia.some(
          (asset) => regex.test(asset.alt) || regex.test(asset.url),
        ) && (
          <section className="mb-6">
            <h2 className="mb-3 text-base font-extrabold">Website images</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {bundledMedia
                .filter(
                  (asset) => regex.test(asset.alt) || regex.test(asset.url),
                )
                .map((asset) => (
                  <article key={asset.url} className="panel overflow-hidden">
                    <div
                      className={
                        "relative aspect-video " +
                        (asset.url.endsWith(".svg") ? "bg-ink" : "bg-tint")
                      }
                    >
                      <Image
                        src={asset.url}
                        alt={asset.alt}
                        fill
                        sizes="(min-width:1200px) 23vw, 45vw"
                        className={
                          asset.url.endsWith(".svg")
                            ? "object-contain p-3"
                            : "object-cover"
                        }
                      />
                    </div>
                    <div className="grid gap-1 p-2.5">
                      <p className="text-xs font-bold">{asset.alt}</p>
                      <Copy value={asset.url} />
                    </div>
                  </article>
                ))}
            </div>
          </section>
        )}
      {rows.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => (
            <article key={String(r._id)} className="panel overflow-hidden">
              <div className="relative aspect-video bg-tint">
                <Image
                  src={r.url}
                  alt={r.alt}
                  fill
                  sizes="(min-width:1200px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="grid gap-3 p-4">
                <p className="text-xs text-muted">
                  {r.width} × {r.height} · {Math.ceil(r.bytes / 1024)} KB ·{" "}
                  {r.format.toUpperCase()}
                </p>
                <Copy value={r.url} />
                <ActionForm className="grid gap-2" action={updateMedia}>
                  <input type="hidden" name="id" value={String(r._id)} />
                  <label className="text-xs font-bold">
                    Alt text
                    <input
                      className="field mt-1"
                      name="alt"
                      defaultValue={r.alt}
                      maxLength={240}
                    />
                  </label>
                  <Submit>Save alt text</Submit>
                </ActionForm>
                <ActionForm action={updateMedia} message="Image deleted">
                  <input type="hidden" name="id" value={String(r._id)} />
                  <input type="hidden" name="action" value="delete" />
                  <Submit danger confirmText="Permanently remove this image?">
                    Delete
                  </Submit>
                </ActionForm>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="panel p-5 text-sm text-muted">No images found.</p>
      )}
      <nav
        aria-label="Media pages"
        className="mt-4 flex gap-4 text-sm font-bold"
      >
        {page > 1 && (
          <Link href={"?" + new URLSearchParams({ q, page: String(page - 1) })}>
            Previous
          </Link>
        )}
        <span>Page {page}</span>
        {page * 18 < total && (
          <Link href={"?" + new URLSearchParams({ q, page: String(page + 1) })}>
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}
