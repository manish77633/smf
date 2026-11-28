"use client";

import { useState } from "react";
import Image from "next/image";
import { Monitor, Smartphone } from "lucide-react";
import type { Seo } from "@/lib/content";
import { searchAppearance } from "@/lib/metadata";
import type { SeoSettings } from "@/lib/seo-settings";
import MediaPicker, { type Asset } from "./media-picker";

type TextKey = Exclude<keyof Seo, "index" | "follow" | "sitemap">;
const textFields: Record<TextKey, { label: string; limit: number; rows?: number }> = {
  title: { label: "SEO title", limit: 240 },
  description: { label: "Meta description", limit: 4000, rows: 3 },
  canonical: { label: "Canonical URL", limit: 600 },
  ogTitle: { label: "Social title", limit: 240 },
  ogDescription: { label: "Social description", limit: 4000, rows: 3 },
  ogImage: { label: "Social image", limit: 600 },
  ogImageAlt: { label: "Social image alt text", limit: 240 },
  twitterTitle: { label: "X / Twitter title", limit: 240 },
  twitterDescription: { label: "X / Twitter description", limit: 4000, rows: 3 },
  twitterImage: { label: "X / Twitter image", limit: 600 },
  twitterImageAlt: { label: "X / Twitter image alt text", limit: 240 },
};
const crawlFields = [
  ["index", "Allow indexing"],
  ["follow", "Allow crawlers to follow links"],
  ["sitemap", "Include in XML sitemap"],
] as const;

export default function SeoFields({
  value,
  onChange,
  settings,
  media,
  path,
  base,
  pageTitle,
}: {
  value: Seo;
  onChange: (value: Seo) => void;
  settings: SeoSettings;
  media: Asset[];
  path: string;
  base: string;
  pageTitle?: string;
}) {
  const [mobile, setMobile] = useState(false);
  const metadata = searchAppearance(settings, value, path, base, pageTitle);
  const previewImage = /^(?:\/(?!\/)|https:\/\/res\.cloudinary\.com\/)/.test(metadata.image)
    ? metadata.image
    : "";
  function field(key: TextKey) {
    const { label, limit, rows } = textFields[key];
    const props = {
      className: "field w-full",
      maxLength: limit,
      value: value[key] ?? "",
      placeholder: key === "canonical" ? (base + path) : undefined,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange({ ...value, [key]: event.target.value }),
    };
    return (
      <label key={key} className="grid gap-1 text-sm font-bold">
        {label}
        {rows ? <textarea rows={rows} {...props} /> : <input {...props} />}
      </label>
    );
  }
  function imageFields(key: "ogImage" | "twitterImage", alt: "ogImageAlt" | "twitterImageAlt") {
    return (
      <div className="grid gap-2">
        {field(key)}
        <MediaPicker
          media={media}
          value={value[key]}
          onSelect={(url) =>
            onChange({ ...value, [key]: url, [alt]: media.find((asset) => asset.url === url)?.alt || "" })
          }
        />
        {field(alt)}
      </div>
    );
  }
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="grid min-w-0 gap-4">
        {field("title")}
        {field("description")}
        {field("canonical")}
        <fieldset className="grid min-w-0 gap-3 rounded-lg border border-rule p-3">
          <legend className="px-1 text-sm font-extrabold">Social sharing</legend>
          {field("ogTitle")}
          {field("ogDescription")}
          {imageFields("ogImage", "ogImageAlt")}
          <details className="min-w-0 border-t border-rule pt-3">
            <summary className="cursor-pointer text-sm font-bold">X / Twitter overrides</summary>
            <div className="mt-3 grid gap-3">
              {field("twitterTitle")}
              {field("twitterDescription")}
              {imageFields("twitterImage", "twitterImageAlt")}
            </div>
          </details>
        </fieldset>
        <fieldset className="grid gap-2 rounded-lg border border-rule p-3">
          <legend className="px-1 text-sm font-extrabold">Search visibility</legend>
          {crawlFields.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.checked })} />
              {label}
            </label>
          ))}
        </fieldset>
      </div>
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Preview width">
          <button type="button" aria-pressed={!mobile} onClick={() => setMobile(false)} className="inline-flex items-center gap-2 rounded-md border border-rule px-3 py-2 text-xs font-bold aria-pressed:bg-softblue">
            <Monitor size={15} aria-hidden /> Desktop
          </button>
          <button type="button" aria-pressed={mobile} onClick={() => setMobile(true)} className="inline-flex items-center gap-2 rounded-md border border-rule px-3 py-2 text-xs font-bold aria-pressed:bg-softblue">
            <Smartphone size={15} aria-hidden /> Mobile
          </button>
        </div>
        <div className={mobile ? "mx-auto grid max-w-[340px] gap-3" : "grid gap-3"}>
          <section className="min-w-0 rounded-lg border border-rule bg-white p-4">
            <h3 className="mb-3 text-xs font-extrabold">Search preview</h3>
            <p className="truncate text-xs text-muted" title={metadata.canonical}>{metadata.canonical}</p>
            <p className="mt-1 line-clamp-2 text-lg font-bold text-[#244487]">{metadata.title}</p>
            <p className="mt-1 line-clamp-3 text-sm">{metadata.description || "Add a meta description."}</p>
            <p className="mt-3 text-xs text-muted">
              {settings.index && value.index ? "Search engines may display a different title and description." : "This page requests exclusion from search results."}
            </p>
          </section>
          <section className="min-w-0 overflow-hidden rounded-lg border border-rule bg-white">
            <h3 className="px-4 py-3 text-xs font-extrabold">Social preview</h3>
            {previewImage && (
              <div className="relative aspect-[1.91] bg-tint">
                <Image src={previewImage} alt={value.ogImageAlt || ""} fill unoptimized className="object-cover" />
              </div>
            )}
            <div className="border-t border-rule px-4 py-3">
              <p className="truncate text-xs text-muted">{settings.websiteName}</p>
              <p className="mt-1 line-clamp-2 text-sm font-extrabold">{value.ogTitle || metadata.label}</p>
              <p className="line-clamp-3 text-sm">{value.ogDescription || metadata.description}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
