import Image from "next/image";
import type { Photo } from "@/lib/content";

export default function PublishedHeroImages({ images }: {
  images: { key: string; label: string; photo: Photo }[];
}) {
  if (!images.length) return null;
  return (
    <details className="panel mb-4 p-3">
      <summary className="cursor-pointer text-sm font-bold">Published hero images</summary>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {images.map(({ key, label, photo }) => (
          <li key={key} className="flex items-center gap-3 text-sm">
            {photo.image && (
              <Image src={photo.image} alt={photo.alt} width={80} height={56}
                className="h-14 w-20 shrink-0 rounded object-cover" unoptimized />
            )}
            <div className="min-w-0">
              <p className="font-bold">{label}</p>
              <p className="break-all text-xs text-muted">{photo.image || "No image"}</p>
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
}
