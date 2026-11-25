"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Image as ImageIcon, RefreshCw, X } from "lucide-react";
export type Asset = { url: string; alt: string };
export default function MediaPicker({
  media,
  value,
  onSelect,
}: {
  media: Asset[];
  value: string;
  onSelect: (url: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    router = useRouter();
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [pending, start] = useTransition();
  const list = media.filter((asset) =>
    (asset.alt + " " + asset.url)
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  return (
    <>
      <div className="flex items-center gap-3">
        {/^(?:\/(?!\/)|https:\/\/res\.cloudinary\.com\/)/.test(value) && (
          <span className="relative block size-10 overflow-hidden rounded-md bg-tint">
            <Image
              src={value}
              alt=""
              fill
              sizes="40px"
              className="object-cover"
              unoptimized
            />
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(true);
            dialog.current?.showModal();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-rule bg-white px-3 py-2 text-xs font-bold hover:bg-tint"
        >
          <ImageIcon size={15} /> Choose from Media Library
        </button>
      </div>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        aria-label="Choose from Media Library"
        className="panel m-auto max-h-[85dvh] w-[min(94vw,760px)] overflow-y-auto p-5 text-navy shadow-2xl backdrop:bg-ink/65"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">Media Library</h2>
          <button
            type="button"
            aria-label="Close media picker"
            className="arrow"
            onClick={() => dialog.current?.close()}
          >
            <X size={17} />
          </button>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            className="field min-w-32 flex-1"
            aria-label="Search library images"
            placeholder="Search by name or alt text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="arrow disabled:opacity-50"
            aria-label="Refresh library"
            disabled={pending}
            onClick={() => start(() => router.refresh())}
          >
            <RefreshCw size={15} />
          </button>
          <Link
            target="_blank"
            href="/admin/media"
            className="text-xs font-bold underline"
          >
            Upload in Media Library ↗
          </Link>
        </div>
        {open &&
          (list.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {list.map((asset) => (
                <button
                  type="button"
                  key={asset.url}
                  onClick={() => {
                    onSelect(asset.url);
                    dialog.current?.close();
                  }}
                  className={
                    "overflow-hidden rounded-lg border text-left hover:border-navy " +
                    (asset.url === value ? "border-navy" : "border-rule")
                  }
                >
                  <span className="relative block aspect-video bg-tint">
                    <Image
                      src={asset.url}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 230px, 45vw"
                      className="object-cover"
                    />
                  </span>
                  <span className="block truncate px-2 py-2 text-xs font-bold">
                    {asset.alt || asset.url.split("/").at(-1)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-tint p-4 text-sm text-muted">
              {media.length
                ? "No images match this search."
                : "Upload an image in Media Library, then refresh this picker."}
            </p>
          ))}
      </dialog>
    </>
  );
}
