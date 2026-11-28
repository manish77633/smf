"use client";

import { useEffect, useState, useTransition } from "react";
import { Save, Send } from "lucide-react";
import { toast } from "sonner";
import { saveSeo } from "@/app/admin/seo-actions";
import type { Seo } from "@/lib/content";
import { seoSettings, type SeoSettings } from "@/lib/seo-settings";
import { Row } from "./cms-editor";
import type { Asset } from "./media-picker";
import SeoFields from "./seo-fields";

type Target =
  | { target: "site"; value: SeoSettings }
  | { target: "home"; value: Seo; title: string }
  | { target: "page"; value: Seo; slug: string; title: string };

export default function SeoEditor({
  initial,
  initialRevision,
  live,
  settings,
  base,
  media,
}: {
  initial: Target;
  initialRevision: number;
  live: boolean;
  settings: SeoSettings;
  base: string;
  media: Asset[];
}) {
  const [doc, setDoc] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [revision, setRevision] = useState(initialRevision);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(doc) !== JSON.stringify(saved);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function save(publish: boolean) {
    start(async () => {
      setError("");
      try {
        const result = await saveSeo({ ...doc, revision, publish });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setRevision(result.revision);
        setSaved(doc);
        toast.success(publish ? "SEO published" : "SEO draft saved");
      } catch {
        setError("Could not save SEO. Try again.");
      }
    });
  }
  return (
    <section className="panel min-w-0 p-4 sm:p-5">
      <h2 className="mb-4 break-words text-xl font-extrabold">
        {doc.target === "site" ? "Site-wide SEO defaults" : doc.title}
      </h2>
      <fieldset disabled={pending} className="min-w-0">
        {doc.target === "site" ? (
          <Row name="Site-wide SEO" value={doc.value} schema={seoSettings} media={media}
            onChange={(value) => setDoc({ target: "site", value: value as SeoSettings })} />
        ) : (
          <SeoFields
            value={doc.value}
            onChange={(value) => setDoc({ ...doc, value })}
            settings={settings}
            media={media}
            base={base}
            path={doc.target === "home" ? "/" : "/" + doc.slug}
            pageTitle={doc.target === "page" ? doc.title : undefined}
          />
        )}
      </fieldset>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
        <div className="text-sm text-muted">
          {dirty ? "Unsaved changes" : live ? "Page is published" : "Page is a draft"}
          {!live && <p>Publish the page before publishing its SEO.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={pending} onClick={() => save(false)} className="inline-flex items-center gap-2 rounded-md border border-rule px-3 py-2 text-sm font-bold disabled:opacity-50">
            <Save size={15} aria-hidden /> Save SEO draft
          </button>
          <button type="button" disabled={!live || pending} onClick={() => save(true)} className="button gap-2 disabled:opacity-50">
            <Send size={15} aria-hidden /> Publish SEO
          </button>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-bold text-brand">{error}</p>}
    </section>
  );
}
