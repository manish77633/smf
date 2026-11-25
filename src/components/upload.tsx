"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
export default function Upload() {
  const [pending, start] = useTransition(),
    router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <form
      className="panel grid gap-3 p-4 sm:grid-cols-3"
      action={(data) =>
        start(async () => {
          try {
            const response = await fetch("/api/media", {
              method: "POST",
              body: data,
            });
            const body = await response.json();
            if (!response.ok) {
              toast.error(body.message);
              return;
            }
            toast.success("Image uploaded");
            router.refresh();
          } catch {
            toast.error("Media upload failed.");
          }
        })
      }
    >
      <label
        className={
          "flex items-center gap-4 rounded-xl border border-dashed p-5 sm:col-span-3 " +
          (dragging ? "border-navy bg-softblue" : "border-rule bg-tint")
        }
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          if (file && input.current) {
            const transfer = new DataTransfer();
            transfer.items.add(file);
            input.current.files = transfer.files;
          }
        }}
      >
        <UploadCloud size={25} className="shrink-0" aria-hidden />
        <span className="min-w-0 flex-1">
          <strong className="block text-sm">
            Drop an image or choose a file
          </strong>
          <span className="text-xs text-muted">
            JPEG, PNG or WebP · up to 4 MB
          </span>
          <input
            ref={input}
            aria-label="Image"
            required
            type="file"
            className="field mt-1"
            name="file"
            accept="image/jpeg,image/png,image/webp"
          />
        </span>
      </label>
      <label className="text-xs font-bold sm:col-span-2">
        Alt text
        <input className="field mt-1" name="alt" maxLength={240} />
      </label>
      <button
        className="button self-end disabled:opacity-50"
        disabled={pending}
      >
        {pending ? "Uploading…" : "Upload image"}
      </button>
    </form>
  );
}
