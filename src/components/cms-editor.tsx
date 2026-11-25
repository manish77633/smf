"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { saveContent } from "@/app/admin/actions";
import {
  entities,
  globals,
  pageFields,
  sections,
  type EntityKey,
  type Section,
  type Site,
} from "@/lib/content";
const RichEditor = dynamic(() => import("./rich-editor"), {
  ssr: false,
  loading: () => <p className="text-sm">Loading editor…</p>,
});
import MediaPicker, { type Asset } from "./media-picker";
import Link from "next/link";
import EditorIconButton from "./editor-icon-button";
import Image from "next/image";
import type { Item } from "@/lib/content";
type Model = Site & { revision: number };
type Props = {
  initial: Model;
  tab: string;
  media: Asset[];
  loanPageSlugs: string[];
};
const pretty = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (v) => v.toUpperCase())
    .replace(/^Og /, "Open Graph ");
import IconPicker from "./icon-picker";
function defaults(schema: z.ZodType, key = ""): unknown {
  if (schema instanceof z.ZodObject)
    return Object.fromEntries(
      Object.entries(schema.shape).map(([k, v]) => [
        k,
        defaults(v as z.ZodType, k),
      ]),
    );
  if (schema instanceof z.ZodArray) return [];
  if (schema instanceof z.ZodEnum) return schema.options[0];
  if (schema instanceof z.ZodBoolean) return false;
  if (schema instanceof z.ZodNumber)
    return key === "rating" || key === "minutes"
      ? 1
      : key === "opacity"
        ? 0.78
        : 0;
  return "";
}
export function Row({
  value,
  onChange,
  schema,
  name,
  media,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  schema: z.ZodType;
  name: string;
  media: Asset[];
}) {
  const label = pretty(name);
  if (schema instanceof z.ZodOptional) {
    const inner = schema.unwrap() as z.ZodType;
    return (
      <Row
        value={value ?? defaults(inner)}
        onChange={onChange}
        schema={inner}
        name={name}
        media={media}
      />
    );
  }
  if (schema instanceof z.ZodObject) {
    const data = (value || {}) as Record<string, unknown>;
    const photo =
      typeof data.image === "string" &&
      /^(?:\/images\/|\/media\/|https:\/\/res\.cloudinary\.com\/)/.test(
        data.image,
      ) &&
      "alt" in schema.shape
        ? data.image
        : null;
    return (
      <div className="grid min-w-0 items-start gap-3 sm:grid-cols-2">
        {Object.entries(schema.shape).map(([key, sub]) => {
          const field = sub as z.ZodType;
          const group =
            field instanceof z.ZodObject ||
            field instanceof z.ZodArray ||
            (field instanceof z.ZodOptional &&
              (field.unwrap() instanceof z.ZodObject ||
                field.unwrap() instanceof z.ZodArray));
          return (
            <div
              className={
                group ||
                [
                  "body",
                  "description",
                  "disclaimer",
                  "review",
                  "answer",
                  "excerpt",
                ].includes(key)
                  ? "min-w-0 sm:col-span-2"
                  : "min-w-0"
              }
              key={key}
            >
              {group ? (
                <fieldset className="rounded-lg border border-rule p-3">
                  <legend className="px-1 text-sm font-extrabold">
                    {pretty(key)}
                  </legend>
                  <Row
                    name={key}
                    schema={field}
                    value={data[key]}
                    onChange={(v) => onChange({ ...data, [key]: v })}
                    media={media}
                  />
                </fieldset>
              ) : (
                <Row
                  name={key}
                  schema={field}
                  value={data[key]}
                  onChange={(v) =>
                    onChange({
                      ...data,
                      [key]: v,
                      ...(key === "image" &&
                      "alt" in data &&
                      !data.alt &&
                      media.find((m) => m.url === v)?.alt
                        ? { alt: media.find((m) => m.url === v)!.alt }
                        : {}),
                    })
                  }
                  media={media}
                />
              )}
            </div>
          );
        })}
        {photo && (
          <figure className="editor-media-preview sm:col-span-2">
            <div className="relative h-[clamp(100px,13vw,180px)] bg-tint">
              <Image
                src={photo}
                alt={String(data.alt || "")}
                fill
                sizes="(min-width: 1024px) 78vw, 92vw"
                className="object-cover"
              />
            </div>
            <figcaption className="break-words px-3 py-2 text-xs text-muted">
              {String(data.alt || "Selected image")}
            </figcaption>
          </figure>
        )}
      </div>
    );
  }
  if (schema instanceof z.ZodArray) {
    const values = (value || []) as unknown[],
      element = schema.element as z.ZodType;
    const change = (i: number, v: unknown) =>
      onChange(values.map((a, j) => (i === j ? v : a)));
    const move = (i: number, j: number) => {
      const reordered = arrayMove(values, i, j);
      onChange(
        reordered.map((a, k) =>
          a && typeof a === "object" && "order" in a ? { ...a, order: k } : a,
        ),
      );
    };
    return (
      <div className="grid gap-3">
        {values.map((item, i) => {
          const row = item as Record<string, unknown>;
          const title =
            typeof row === "object" && row
              ? row.title || row.label || row.name || row.question || row.from
              : item;
          return (
            <details
              open
              key={i}
              className="rounded-md border border-rule bg-slate-50/70"
            >
              <summary className="px-3 py-2 text-xs font-bold">
                {typeof title === "string" && title ? title : "Item " + (i + 1)}
              </summary>
              <div className="grid gap-2 border-t border-rule p-2.5">
                <Row
                  value={item}
                  onChange={(v) => change(i, v)}
                  schema={element}
                  name="value"
                  media={media}
                />
                <div className="flex flex-wrap justify-end gap-1">
                  <EditorIconButton
                    icon={ArrowUp}
                    label={"Move item " + (i + 1) + " up"}
                    disabled={i === 0}
                    onClick={() => move(i, i - 1)}
                  />
                  <EditorIconButton
                    icon={ArrowDown}
                    label={"Move item " + (i + 1) + " down"}
                    disabled={i === values.length - 1}
                    onClick={() => move(i, i + 1)}
                  />
                  <EditorIconButton
                    icon={Trash2}
                    label={"Remove item " + (i + 1)}
                    tone="danger"
                    onClick={() => {
                      if (confirm("Remove this item from the draft?"))
                        onChange(values.filter((_, j) => j !== i));
                    }}
                  />
                </div>
              </div>
            </details>
          );
        })}
        <button
          type="button"
          className="justify-self-start rounded-md border border-rule bg-white px-3 py-2 text-sm font-bold"
          onClick={() => {
            const item = defaults(element);
            onChange([
              ...values,
              item && typeof item === "object" && "order" in item
                ? { ...item, order: values.length }
                : item,
            ]);
          }}
        >
          Add item
        </button>
      </div>
    );
  }
  if (schema instanceof z.ZodBoolean)
    return (
      <label className="flex items-center gap-2 py-2 text-sm font-bold">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    );
  if (name === "icon")
    return (
      <IconPicker
        label={label}
        value={String(value || "")}
        onChange={onChange}
      />
    );
  if (schema instanceof z.ZodEnum)
    return (
      <label className="grid gap-1 text-sm font-bold">
        {label}
        <select
          className="field"
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
        >
          {schema.options.map((option) => (
            <option key={String(option)}>{String(option)}</option>
          ))}
        </select>
      </label>
    );
  if (name === "body")
    return (
      <div className="grid gap-1">
        <span className="text-sm font-bold">{label}</span>
        <RichEditor value={String(value || "")} onChange={onChange} />
      </div>
    );
  const isImage = [
    "image",
    "logo",
    "ogImage",
    "twitterImage",
    "defaultImage",
    "favicon",
  ].includes(name);
  const long = [
    "description",
    "description",
    "review",
    "answer",
    "disclaimer",
    "excerpt",
    "metaDescription",
    "ogDescription",
    "twitterDescription",
    "badgeCopy",
  ].includes(name);
  return (
    <div className="grid gap-1">
      <label className="grid gap-1 text-sm font-bold">
        {label}
        {long ? (
          <textarea
            className="field min-h-20 font-normal"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            className="field font-normal"
            type={
              schema instanceof z.ZodNumber
                ? "number"
                : name === "date"
                  ? "date"
                  : "text"
            }
            step={name === "opacity" ? "0.01" : "1"}
            value={String(value ?? "")}
            onChange={(e) =>
              onChange(
                schema instanceof z.ZodNumber
                  ? Number(e.target.value)
                  : e.target.value,
              )
            }
          />
        )}
      </label>
      {isImage && (
        <MediaPicker
          media={media}
          value={typeof value === "string" ? value : ""}
          onSelect={onChange}
        />
      )}
    </div>
  );
}
function LoanCards({
  loans,
  liveSlugs,
  media,
  onChange,
}: {
  loans: Item<"loans">[];
  liveSlugs: string[];
  media: Asset[];
  onChange: (loans: Item<"loans">[]) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const loan = active === null ? null : loans[active];
  const slugify = (title: string) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const small =
    "rounded-lg border border-rule bg-white px-3 py-2 text-xs font-bold hover:bg-tint disabled:opacity-40";
  function move(index: number, offset: number) {
    onChange(
      arrayMove(loans, index, index + offset).map((item, order) => ({
        ...item,
        order,
      })),
    );
    setActive(null);
  }
  return (
    <div className="grid min-w-0 grid-cols-1 gap-3">
      <div className="flex flex-wrap gap-2">
        <input
          className="field min-w-40 flex-1"
          aria-label="Search loan cards"
          placeholder="Search loan cards"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className={small}
          type="button"
          onClick={() => {
            setSearch("");
            setActive(loans.length);
            onChange([
              ...loans,
              {
                title: "",
                slug: "",
                description: "",
                icon: "Landmark",
                red: false,
                cta: { label: "View loan details", url: "", enquiry: false },
                featured: false,
                visible: true,
                order: loans.length,
              },
            ]);
          }}
        >
          Add loan card
        </button>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {loans.map(
          (item, index) =>
            item.title.toLowerCase().includes(search.toLowerCase()) && (
              <article
                key={index}
                className={
                  "panel lift-card flex min-w-0 flex-col gap-2 p-3 " +
                  (active === index ? "ring-2 ring-navy/40" : "")
                }
              >
                <div>
                  <p className="text-xs text-muted">
                    {item.visible ? "Visible" : "Hidden"}
                  </p>
                  <h3 className="mt-1 break-words text-base font-extrabold">
                    {item.title || "New loan card"}
                  </h3>
                  <p className="mt-1 truncate text-xs text-muted">
                    {item.description}
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <button
                    className={small}
                    type="button"
                    onClick={() => setActive(index)}
                  >
                    Edit card
                  </button>
                  {liveSlugs.includes(item.slug) && (
                    <Link
                      className="text-xs font-bold underline"
                      href={"/admin/pages/" + item.slug}
                    >
                      Edit page
                    </Link>
                  )}
                  <button
                    type="button"
                    className={small}
                    aria-label={"Move " + item.title + " earlier"}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={small}
                    aria-label={"Move " + item.title + " later"}
                    disabled={index === loans.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    ↓
                  </button>
                </div>
              </article>
            ),
        )}
      </div>
      {loan && active !== null && (
        <section className="panel grid gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-extrabold">{loan.title || "New loan card"}</h3>
            <button
              className={small}
              type="button"
              onClick={() => setActive(null)}
            >
              Close card editor
            </button>
          </div>
          <p className="text-xs text-muted">
            Leave the button URL blank to open the loan detail page. Select
            Enquiry to open the enquiry form.
          </p>
          <Row
            name="Loan card"
            schema={
              liveSlugs.includes(loan.slug)
                ? entities.loans.omit({ slug: true })
                : entities.loans
            }
            value={loan}
            media={media}
            onChange={(value) => {
              const next = value as Item<"loans">;
              if (
                next.title !== loan.title &&
                next.slug === loan.slug &&
                (!loan.slug ||
                  (!liveSlugs.includes(loan.slug) &&
                    loan.slug === slugify(loan.title)))
              )
                next.slug = slugify(next.title);
              onChange(loans.map((item, i) => (i === active ? next : item)));
            }}
          />
          <button
            type="button"
            className={small + " justify-self-start text-brand"}
            onClick={() => {
              if (confirm("Remove this loan card from the draft?")) {
                onChange(loans.filter((_, i) => i !== active));
                setActive(null);
              }
            }}
          >
            Remove loan card
          </button>
        </section>
      )}
    </div>
  );
}

export function SortableEditorSection({
  section,
  children,
  index,
  toggle,
  moveUp,
  moveDown,
  remove,
}: {
  section: { id: string; label: string; type: string; visible: boolean };
  children: React.ReactNode;
  index: number;
  toggle: () => void;
  moveUp?: () => void;
  moveDown?: () => void;
  remove?: () => void;
}) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({ id: section.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="editor-section"
    >
      <header className="editor-section-header">
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={"Reorder " + section.label}
          className="admin-icon-button touch-none"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={15} />
        </button>
        <span className="editor-section-index">{index + 1}</span>
        <div className="mr-auto min-w-0">
          <h2 className="text-sm font-extrabold">{section.label}</h2>
          <p className="text-xs text-muted">
            {section.type}
            {!section.visible ? " · Hidden" : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <EditorIconButton
            icon={ArrowUp}
            onClick={moveUp}
            disabled={!moveUp}
            label={"Move " + section.label + " up"}
          />
          <EditorIconButton
            icon={ArrowDown}
            onClick={moveDown}
            disabled={!moveDown}
            label={"Move " + section.label + " down"}
          />
          <EditorIconButton
            icon={section.visible ? Eye : EyeOff}
            onClick={toggle}
            aria-pressed={section.visible}
            label={"Show " + section.label + " on website"}
            tooltip={section.visible ? "Hide section" : "Show section"}
            hiddenState={!section.visible}
          />
          {remove && (
            <EditorIconButton
              icon={Trash2}
              label={"Remove " + section.label}
              tooltip="Remove section"
              tone="danger"
              onClick={remove}
            />
          )}
        </div>
      </header>
      <div className="editor-section-content">{children}</div>
    </div>
  );
}
export default function Editor({ initial, tab, media, loanPageSlugs }: Props) {
  const [doc, set] = useState(initial),
    [saved, setSaved] = useState(initial);
  const [selection, setSelection] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [filter, setFilter] = useState("");
  const active = selection || tab;
  const dirty = JSON.stringify(doc) !== JSON.stringify(saved);
  const moveSection = (id: Section["id"], direction: number) => {
    set((d) => {
      const index = d.sections.findIndex((section) => section.id === id);
      return {
        ...d,
        sections: arrayMove(d.sections, index, index + direction),
      };
    });
  };
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const warnLink = (event: MouseEvent) => {
      const link = (event.target as Element).closest("a");
      if (
        link?.target !== "_blank" &&
        link?.href &&
        !confirm("Leave without saving your draft?")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", warnLink, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", warnLink, true);
    };
  }, [dirty]);
  const section = doc.sections.find((s) => s.id === active);
  const mainSections = doc.sections.filter(
    (s) => !["header", "bar", "footer"].includes(s.type),
  );
  const topBar = doc.sections.find((s) => s.type === "bar");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const editSection = (
    id: Section["id"],
    part: Partial<{
      label: string;
      visible: boolean;
      content: Section["content"];
    }>,
  ) =>
    set((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.id === id ? ({ ...s, ...part } as Section) : s,
      ),
    }));
  const editorBody = (section: Section) => {
    const collection =
      section.type in entities ? (section.type as EntityKey) : undefined;
    return (
      <>
        <label className="mb-4 grid max-w-md gap-1 text-xs font-bold">
          Section name
          <input
            className="field"
            value={section.label}
            onChange={(e) => editSection(section.id, { label: e.target.value })}
          />
        </label>
        <Row
          schema={sections[section.type]}
          value={
            section.type === "header"
              ? { loanMenu: true, loanMenuUrl: "/services", ...section.content }
              : section.content
          }
          onChange={(v) =>
            editSection(section.id, { content: v as Section["content"] })
          }
          name="section"
          media={media}
        />
        {collection && (
          <div className="mt-5 border-t border-rule pt-4">
            <h3 className="mb-3 text-sm font-extrabold">
              {collection === "loans"
                ? "Loan cards in display order"
                : "Manage " + collection}
            </h3>
            {collection === "loans" ? (
              <LoanCards
                loans={doc.records.loans}
                liveSlugs={loanPageSlugs}
                media={media}
                onChange={(loans) =>
                  set((d) => ({ ...d, records: { ...d.records, loans } }))
                }
              />
            ) : (
              <Row
                schema={z.array(entities[collection])}
                value={doc.records[collection]}
                onChange={(v) =>
                  set((d) => ({
                    ...d,
                    records: { ...d.records, [collection]: v },
                  }))
                }
                name={collection}
                media={media}
              />
            )}
          </div>
        )}
      </>
    );
  };
  const save = (publish: boolean) =>
    start(async () => {
      const result = await saveContent(doc, publish);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      const next = { ...doc, revision: result.revision };
      set(next);
      setSaved(next);
      toast.success(publish ? "Homepage published" : "Draft saved");
    });
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold text-muted">
            Admin / Homepage management
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {section?.label ||
              {
                seo: "SEO Management",
                whatsapp: "WhatsApp Settings",
                general: "General Settings",
              }[active] ||
              "Homepage Management"}
          </h1>
          <p className="mt-2 text-sm text-muted" role="status">
            {dirty
              ? "Unsaved changes"
              : doc.page.status === "published"
                ? "Publication enabled"
                : "Publication disabled"}
          </p>
        </div>
      </div>
      <fieldset disabled={pending} className="grid gap-3">
        {section ? (
          <section className="editor-section">
            <header className="editor-section-header">
              <button
                type="button"
                className="mr-auto text-xs font-bold underline"
                onClick={() => setSelection("overview")}
              >
                All sections
              </button>
              <EditorIconButton
                icon={section.visible ? Eye : EyeOff}
                aria-pressed={section.visible}
                label={"Show " + section.label + " on website"}
                tooltip={section.visible ? "Hide section" : "Show section"}
                hiddenState={!section.visible}
                onClick={() =>
                  editSection(section.id, { visible: !section.visible })
                }
              />
            </header>
            <div className="editor-section-content">{editorBody(section)}</div>
            {section.type === "header" && topBar && (
              <div className="editor-section-content border-t border-rule">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-extrabold">
                    Top information bar
                  </h2>
                  <EditorIconButton
                    icon={topBar.visible ? Eye : EyeOff}
                    label="Show top information bar"
                    aria-pressed={topBar.visible}
                    onClick={() =>
                      editSection("bar", { visible: !topBar.visible })
                    }
                  />
                </div>
                {editorBody(topBar)}
              </div>
            )}
          </section>
        ) : active === "seo" ? (
          <section className="panel grid gap-5 p-5">
            <Row
              schema={pageFields.shape.seo}
              value={doc.page.seo}
              onChange={(v) =>
                set((d) => ({
                  ...d,
                  page: { ...d.page, seo: v as Site["page"]["seo"] },
                }))
              }
              name="homepage SEO"
              media={media}
            />
            <div className="rounded-lg border border-rule p-4">
              <p className="text-sm font-extrabold">Search preview</p>
              <p className="mt-2 text-xs text-muted">
                {doc.page.seo.canonical ||
                  doc.settings.baseUrl ||
                  "Set the website URL in General Settings"}
              </p>
              <p className="mt-1 text-lg font-bold text-blue-700">
                {doc.page.seo.title || doc.settings.defaultTitle}
              </p>
              <p className="text-sm text-muted">
                {doc.page.seo.description || doc.settings.defaultDescription}
              </p>
              <p className="mt-3 text-xs text-muted">
                {(doc.page.seo.title || doc.settings.defaultTitle).length} title
                characters ·{" "}
                {
                  (doc.page.seo.description || doc.settings.defaultDescription)
                    .length
                }{" "}
                description characters
              </p>
              <p className="mt-2 text-xs text-brand">
                {!(doc.page.seo.title || doc.settings.defaultTitle) ||
                !(doc.page.seo.description || doc.settings.defaultDescription)
                  ? "Add a title and description."
                  : ""}
                {JSON.stringify(doc.sections).includes('"alt":""')
                  ? " Review missing image alt text."
                  : ""}
              </p>
            </div>
            <div className="rounded-lg border border-rule p-4">
              <p className="text-sm font-extrabold">Social sharing preview</p>
              <p className="mt-2 font-bold">
                {doc.page.seo.ogTitle ||
                  doc.page.seo.title ||
                  doc.settings.defaultTitle}
              </p>
              <p className="text-sm text-muted">
                {doc.page.seo.ogDescription ||
                  doc.page.seo.description ||
                  doc.settings.defaultDescription}
              </p>
            </div>
          </section>
        ) : active === "general" || active === "whatsapp" ? (
          <section className="panel grid gap-5 p-5">
            <Row
              schema={
                active === "whatsapp"
                  ? globals.shape.whatsapp
                  : globals.omit({ whatsapp: true })
              }
              value={
                active === "whatsapp" ? doc.settings.whatsapp : doc.settings
              }
              onChange={(v) =>
                set((d) => ({
                  ...d,
                  settings: {
                    ...d.settings,
                    ...(active === "whatsapp"
                      ? { whatsapp: v as Site["settings"]["whatsapp"] }
                      : (v as Site["settings"])),
                  },
                }))
              }
              name={active}
              media={media}
            />
          </section>
        ) : (
          <section className="grid gap-4">
            <div className="panel flex flex-wrap gap-3 p-4">
              <label className="grid flex-1 gap-1 text-sm font-bold">
                Page title
                <input
                  className="field"
                  value={doc.page.title}
                  onChange={(e) =>
                    set((d) => ({
                      ...d,
                      page: { ...d.page, title: e.target.value },
                    }))
                  }
                />
              </label>
              <label className="grid gap-1 text-sm font-bold">
                Page status
                <select
                  className="field"
                  value={doc.page.status}
                  onChange={(e) =>
                    set((d) => ({
                      ...d,
                      page: {
                        ...d.page,
                        status: e.target.value as Site["page"]["status"],
                      },
                    }))
                  }
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
            </div>
            <section className="panel space-y-3 p-4">
              <h2 className="text-sm font-extrabold">Search appearance</h2>
              <Row
                schema={pageFields.shape.seo.pick({
                  title: true,
                  description: true,
                })}
                value={doc.page.seo}
                onChange={(v) =>
                  set((d) => ({
                    ...d,
                    page: {
                      ...d.page,
                      seo: { ...d.page.seo, ...(v as Site["page"]["seo"]) },
                    },
                  }))
                }
                name="SEO"
                media={media}
              />
            </section>
            <input
              className="field"
              aria-label="Search homepage sections"
              placeholder="Search sections"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <DndContext
              id="homepage-order"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={({ active, over }) => {
                if (over && active.id !== over.id)
                  set((d) => ({
                    ...d,
                    sections: arrayMove(
                      d.sections,
                      d.sections.findIndex((s) => s.id === active.id),
                      d.sections.findIndex((s) => s.id === over.id),
                    ),
                  }));
              }}
            >
              <SortableContext
                items={mainSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid gap-3">
                  {mainSections
                    .filter((s) =>
                      s.label.toLowerCase().includes(filter.toLowerCase()),
                    )
                    .map((s) => (
                      <SortableEditorSection
                        key={s.id}
                        section={s}
                        index={mainSections.indexOf(s)}
                        moveUp={
                          mainSections[0]?.id === s.id
                            ? undefined
                            : () => moveSection(s.id, -1)
                        }
                        moveDown={
                          mainSections.at(-1)?.id === s.id
                            ? undefined
                            : () => moveSection(s.id, 1)
                        }
                        toggle={() =>
                          set((d) => ({
                            ...d,
                            sections: d.sections.map((item) =>
                              item.id === s.id
                                ? { ...item, visible: !item.visible }
                                : item,
                            ),
                          }))
                        }
                      >
                        {editorBody(s)}
                      </SortableEditorSection>
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          </section>
        )}
      </fieldset>
      <div className="editor-save-bar">
        <span className="mr-auto text-xs text-muted">
          {dirty ? "Unsaved changes" : "Draft is up to date"}
        </span>
        <a
          href="/admin/preview"
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-rule bg-white px-3 py-2 text-sm font-bold"
        >
          <Eye size={14} aria-hidden /> Preview saved draft
        </a>
        <button
          className="rounded-md border border-rule bg-white px-3 py-2 text-sm font-bold disabled:opacity-50"
          disabled={!dirty || pending}
          onClick={() => save(false)}
        >
          <Save size={14} aria-hidden /> Save draft
        </button>
        <button
          className="button min-h-0 px-3 py-2 disabled:opacity-50"
          disabled={pending}
          onClick={() => {
            if (confirm("Publish the current homepage and settings?"))
              save(true);
          }}
        >
          <Send size={14} aria-hidden /> {pending ? "Saving…" : "Publish"}
        </button>
      </div>
    </div>
  );
}
