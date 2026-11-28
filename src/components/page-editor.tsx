"use client";
import Link from "next/link";
import { ArrowLeft, Eye, ExternalLink, Plus, Save, Send } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Row, SortableEditorSection } from "./cms-editor";
import {
  editablePage,
  emptyBlock,
  formFields,
  pageBlock,
  servicesPage,
  contactPage,
  businessLoanPage,
  type EditablePage,
  type PageBlock,
} from "@/lib/pages";
import { editPage } from "@/app/admin/page-actions";
const introOnly = pageBlock.pick({ intro: true });
const fields = {
  custom: introOnly.extend({
    ...pageBlock.pick({ photo: true, body: true, cta: true, icon: true }).shape,
    fields: pageBlock.shape.fields.unwrap(),
  }),
  hero: introOnly.extend(
    pageBlock.pick({
      photo: true,
      cta: true,
      icon: true,
      cardTitle: true,
      cardCopy: true,
    }).shape,
  ),
  breadcrumb: pageBlock.pick({ cardTitle: true, cardCopy: true, cta: true }),
  services: introOnly.extend({
    ...pageBlock.pick({ note: true, items: true }).shape,
    listedLoansOnly: pageBlock.shape.listedLoansOnly.unwrap(),
  }),
  guidance: introOnly.extend(pageBlock.pick({ cta: true, items: true }).shape),
  steps: introOnly.extend({
    items: pageBlock.shape.items,
    dark: pageBlock.shape.dark.unwrap(),
  }),
  overview: introOnly.extend(
    pageBlock.pick({
      photo: true,
      body: true,
      cta: true,
      cardTitle: true,
      cardCopy: true,
    }).shape,
  ),
  highlights: introOnly.extend(pageBlock.pick({ items: true }).shape),
  checklist: introOnly.extend(pageBlock.pick({ items: true }).shape),
  notice: pageBlock.pick({ icon: true, cardTitle: true, cardCopy: true }),
  questions: introOnly.extend(
    pageBlock.pick({ cta: true, cardTitle: true, cardCopy: true, items: true })
      .shape,
  ),
  richText: introOnly.extend(pageBlock.pick({ body: true, cta: true }).shape),
  contactForm: introOnly.extend({
    ...pageBlock.pick({ cardTitle: true, note: true }).shape,
    form: formFields,
  }),
  officeMap: introOnly.extend({
    ...pageBlock.pick({
      cardTitle: true,
      icon: true,
      note: true,
      cta: true,
    }).shape,
    mapUrl: pageBlock.shape.mapUrl.unwrap(),
    fallbackTitle: pageBlock.shape.fallbackTitle.unwrap(),
  }),
};
const labels: Record<PageBlock["type"], string> = {
  custom: "Custom content",
  hero: "Hero",
  breadcrumb: "Breadcrumb",
  services: "Loan categories",
  guidance: "Guidance",
  steps: "Steps",
  questions: "FAQ",
  richText: "Rich text",
  contactForm: "Contact and enquiry form",
  officeMap: "Office map",
  overview: "Image and overview",
  highlights: "Highlights",
  checklist: "Checklist",
  notice: "Information notice",
};
const secondary =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-rule bg-white px-2.5 py-1.5 text-xs font-bold disabled:opacity-40";
function newSection(type: PageBlock["type"]): PageBlock {
  const id = crypto.randomUUID();
  const label = labels[type];
  const template = [servicesPage, contactPage, businessLoanPage]
    .flatMap((page) => page.sections)
    .find((section) => section.type === type);
  if (template) return { ...structuredClone(template), id, label, visible: true };
  const block = emptyBlock(type, id, label);
  if (type === "custom") {
    return {
      ...block,
      intro: { ...block.intro, heading: "New content section", description: "Introduce this section in a sentence." },
      cta: { label: "Contact us", url: "/contact", enquiry: false },
      icon: "Info",
      fields: [{ label: "Key detail", description: "Describe what visitors should know.", icon: "Check", order: 0, visible: true }],
    };
  }
  return {
    ...block,
    intro: { ...block.intro, heading: label },
    ...(type === "richText" ? { body: "<p>Add the information visitors need here.</p>" } : {}),
  };
}
export default function PageEditor({
  initial,
  initialRevision,
  history,
  published,
  media,
  loans,
}: {
  initial: EditablePage;
  initialRevision: number;
  history: string[];
  published: boolean;
  media: { url: string; alt: string }[];
  loans: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [doc, setDoc] = useState(initial),
    [saved, setSaved] = useState(initial),
    [revision, setRevision] = useState(initialRevision),
    [live, setLive] = useState(published);
  const [pending, start] = useTransition(),
    [kind, setKind] = useState<PageBlock["type"]>("custom"),
    [error, setError] = useState("");
  const dirty = JSON.stringify(doc) !== JSON.stringify(saved);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const update = (id: string, changes: Partial<PageBlock>) =>
    setDoc((d) => ({
      ...d,
      sections: d.sections.map((b) => (b.id === id ? { ...b, ...changes } : b)),
    }));
  function move(index: number, delta: number) {
    setDoc((d) => {
      const sections = [...d.sections];
      const [block] = sections.splice(index, 1);
      sections.splice(index + delta, 0, block);
      return { ...d, sections };
    });
  }
  function save(mode: "draft" | "publish" | "unpublish" | "delete") {
    if (
      (mode === "delete" || mode === "unpublish") &&
      !confirm(
        mode === "delete"
          ? "Permanently delete this page?"
          : "Remove this page from the public website?",
      )
    )
      return;
    start(async () => {
      setError("");
      const result = await editPage({
        page: mode === "delete" || mode === "unpublish" ? saved : doc,
        revision,
        mode,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(
        {
          draft: "Draft saved",
          publish: "Page published",
          unpublish: "Page unpublished",
          delete: "Page deleted",
        }[mode],
      );
      if (mode === "delete") {
        router.push("/admin/pages");
        return;
      }
      if (revision === -1) {
        router.replace("/admin/pages/" + doc.slug);
        return;
      }
      setRevision(result.revision);
      if (mode === "unpublish") setLive(false);
      else {
        setSaved(doc);
        if (mode === "publish") {
          setLive(true);
          router.refresh();
        }
      }
    });
  }
  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/admin/pages"
        className="inline-flex items-center gap-1.5 text-xs font-bold underline"
      >
        <ArrowLeft size={14} aria-hidden /> All pages
      </Link>
      <h1 className="my-2 text-3xl font-extrabold">
        {initialRevision < 0 ? "New page" : initial.title}
      </h1>
      <p className="mb-3 text-xs text-muted">
        {live ? "Published" : "Draft"}
        {dirty ? " · Unsaved changes" : ""}
      </p>

      <fieldset disabled={pending} className="grid gap-3">
        <div className="panel grid gap-3 p-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">
            Page title
            <input
              className="field"
              value={doc.title}
              onChange={(e) => setDoc((d) => ({ ...d, title: e.target.value }))}
            />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            URL slug
            <input
              className="field"
              value={doc.slug}
              readOnly={revision >= 0}
              onChange={(e) => setDoc((d) => ({ ...d, slug: e.target.value }))}
            />
          </label>
        </div>
        <section className="panel p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold">Search appearance</h2>
            {initialRevision >= 0 && (
              <Link href={"/admin/seo?target=" + encodeURIComponent("page:" + initial.slug)} className="font-bold underline">
                Open SEO editor
              </Link>
            )}
          </div>
          <div className="mt-4">
            <Row
              name="SEO"
              media={media}
              schema={editablePage.shape.seo.pick({
                title: true,
                description: true,
              })}
              value={doc.seo}
              onChange={(v) =>
                setDoc((d) => ({ ...d, seo: v as EditablePage["seo"] }))
              }
            />
          </div>
          <details className="mt-4">
            <summary className="text-xs font-bold">
              Advanced SEO and social settings
            </summary>
            <div className="mt-3">
              <Row
                name="Advanced SEO"
                media={media}
                schema={editablePage.shape.seo.omit({
                  title: true,
                  description: true,
                })}
                value={doc.seo}
                onChange={(v) =>
                  setDoc((d) => ({ ...d, seo: v as EditablePage["seo"] }))
                }
              />
            </div>
          </details>
        </section>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-extrabold">Page sections</h2>
          <Link
            className="text-sm font-bold underline"
            href="/admin/cms?tab=banner"
          >
            Edit shared red banner
          </Link>
        </div>
        <DndContext
          id="page-section-order"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (!over || active.id === over.id) return;
            setDoc((d) => ({
              ...d,
              sections: arrayMove(
                d.sections,
                d.sections.findIndex((b) => b.id === active.id),
                d.sections.findIndex((b) => b.id === over.id),
              ),
            }));
          }}
        >
          <SortableContext
            items={doc.sections.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {doc.sections.map((block, index) => (
              <SortableEditorSection
                key={block.id}
                section={{ ...block, type: labels[block.type] }}
                index={index}
                collapsible
                toggle={() => update(block.id, { visible: !block.visible })}
                duplicate={doc.sections.length < 40 ? () => {
                  const copy = {
                    ...structuredClone(block),
                    id: crypto.randomUUID(),
                    label: (block.label || labels[block.type]).slice(0, 74) + " copy",
                  };
                  setDoc((d) => ({
                    ...d,
                    sections: [...d.sections.slice(0, index + 1), copy, ...d.sections.slice(index + 1)],
                  }));
                } : undefined}
                moveUp={index ? () => move(index, -1) : undefined}
                moveDown={
                  index < doc.sections.length - 1
                    ? () => move(index, 1)
                    : undefined
                }
                remove={() => {
                  if (confirm("Remove this section from the draft?"))
                    setDoc((d) => ({
                      ...d,
                      sections: d.sections.filter((b) => b.id !== block.id),
                    }));
                }}
              >
                <div className="grid gap-3">
                  <label className="grid max-w-md gap-1 text-sm font-bold">
                    Section name
                    <input
                      className="field"
                      value={block.label}
                      onChange={(e) =>
                        update(block.id, { label: e.target.value })
                      }
                    />
                  </label>
                  <details className="rounded-lg border border-rule p-3">
                    <summary className="cursor-pointer font-bold">Section layout and button</summary>
                    <div className="mt-3 grid gap-3">
                      <Row
                        schema={pageBlock.pick({ spacing: true, secondaryAction: true })}
                        value={block}
                        name="Section layout"
                        media={media}
                        onChange={(value) => update(block.id, value as Partial<PageBlock>)}
                      />
                    </div>
                  </details>
                  {(block.type === "contactForm" ||
                    block.type === "officeMap") && (
                    <p className="text-xs text-muted">
                      Edit phone, email, address and opening hours in{" "}
                      <Link
                        className="font-bold underline"
                        href="/admin/cms?tab=contact"
                      >
                        Contact Details
                      </Link>
                      .
                    </p>
                  )}
                  {block.type === "services" ? (
                    <>
                      <Row
                        name={block.label}
                        schema={fields.services.omit({ items: true })}
                        value={block}
                        media={media}
                        onChange={(v) =>
                          update(block.id, v as Partial<PageBlock>)
                        }
                      />
                      <div className="grid gap-3 rounded-lg border border-rule p-4">
                        <h3 className="font-bold">Loan cards</h3>
                        <p className="text-xs text-muted">
                          Edit shared loan names, icons and buttons in Loan
                          Services. Set the order and page-specific descriptions
                          here.
                        </p>
                        {block.items.length === 0 && (
                          <p className="text-sm text-muted">
                            All published loans will appear in their shared
                            order.
                          </p>
                        )}
                        {block.items.map((item, i) => (
                          <div
                            className="grid gap-2 border-b border-rule pb-3"
                            key={i}
                          >
                            <label className="grid gap-1 text-sm font-bold">
                              Loan
                              <select
                                className="field"
                                value={item.title}
                                onChange={(e) =>
                                  update(block.id, {
                                    items: block.items.map((x, j) =>
                                      i === j
                                        ? { ...x, title: e.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              >
                                <option value="">Choose a loan</option>
                                {loans.map((l) => (
                                  <option key={l.slug} value={l.slug}>
                                    {l.title}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="grid gap-1 text-sm font-bold">
                              Description override
                              <textarea
                                className="field"
                                value={item.description}
                                onChange={(e) =>
                                  update(block.id, {
                                    items: block.items.map((x, j) =>
                                      i === j
                                        ? { ...x, description: e.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            </label>
                            <div className="flex flex-wrap gap-2">
                              <label className="p-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={item.visible}
                                  onChange={(e) =>
                                    update(block.id, {
                                      items: block.items.map((x, j) =>
                                        i === j
                                          ? { ...x, visible: e.target.checked }
                                          : x,
                                      ),
                                    })
                                  }
                                />{" "}
                                Visible
                              </label>
                              {[-1, 1].map((offset) => (
                                <button
                                  className={secondary}
                                  key={offset}
                                  disabled={
                                    i + offset < 0 ||
                                    i + offset >= block.items.length
                                  }
                                  onClick={() => {
                                    const next = [...block.items];
                                    [next[i], next[i + offset]] = [
                                      next[i + offset],
                                      next[i],
                                    ];
                                    update(block.id, {
                                      items: next.map((x, order) => ({
                                        ...x,
                                        order,
                                      })),
                                    });
                                  }}
                                >
                                  {offset < 0 ? "Move up" : "Move down"}
                                </button>
                              ))}
                              <button
                                className={secondary + " text-brand"}
                                onClick={() =>
                                  update(block.id, {
                                    items: block.items.filter(
                                      (_, j) => i !== j,
                                    ),
                                  })
                                }
                              >
                                Remove loan
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          className={secondary + " justify-self-start"}
                          onClick={() =>
                            update(block.id, {
                              items: [
                                ...block.items,
                                {
                                  title: "",
                                  description: "",
                                  visible: true,
                                  icon: "",
                                  order: block.items.length,
                                },
                              ],
                            })
                          }
                        >
                          Add loan
                        </button>
                      </div>
                    </>
                  ) : (
                    <Row
                      name={block.label}
                      schema={fields[block.type]}
                      value={block}
                      media={media}
                      onChange={(v) =>
                        update(block.id, v as Partial<PageBlock>)
                      }
                    />
                  )}
                </div>
              </SortableEditorSection>
            ))}
          </SortableContext>
        </DndContext>
        <div className="panel flex flex-wrap items-end gap-3 p-5">
          <label className="grid gap-1 text-sm font-bold">
            Section type
            <select
              className="field"
              value={kind}
              onChange={(e) => setKind(e.target.value as PageBlock["type"])}
            >
              {Object.entries(labels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button
            className={secondary}
            disabled={doc.sections.length >= 40}
            onClick={() =>
              setDoc((d) => ({
                ...d,
                sections: [
                  ...d.sections,
                  newSection(kind),
                ],
              }))
            }
          >
            <Plus size={14} aria-hidden /> Add section
          </button>
        </div>
      </fieldset>
      {revision >= 0 && (
        <details className="panel mt-4 p-3">
          <summary className="cursor-pointer font-bold">Publish history</summary>
          {history.length ? (
            <ul className="mt-3 grid gap-1 text-sm text-muted">
              {history.map((date, index) => (
                <li key={date + index}>
                  <time dateTime={date}>
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Kolkata",
                    }).format(new Date(date))} IST
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted">No publication entries yet.</p>
          )}
        </details>
      )}
      <div className="editor-save-bar">
        <button
          className={secondary}
          disabled={pending}
          onClick={() => save("draft")}
        >
          <Save size={14} aria-hidden /> Save draft
        </button>
        <button
          className="button min-h-0 py-2 disabled:opacity-40"
          disabled={pending}
          onClick={() => save("publish")}
        >
          <Send size={14} aria-hidden /> Publish
        </button>
        {revision >= 0 && (
          <Link
            className={secondary}
            href={"/admin/pages/" + saved.slug + "/preview"}
            target="_blank"
          >
            <Eye size={14} aria-hidden /> Preview saved draft
          </Link>
        )}
        {live && (
          <>
            <Link className={secondary} href={"/" + saved.slug} target="_blank">
              <ExternalLink size={14} aria-hidden /> View live
            </Link>
            <button
              className={secondary}
              disabled={pending}
              onClick={() => save("unpublish")}
            >
              Unpublish
            </button>
          </>
        )}
        {revision >= 0 && (
          <button
            className={secondary + " text-brand"}
            disabled={pending}
            onClick={() => save("delete")}
          >
            Delete page
          </button>
        )}
        {error && (
          <p
            role="alert"
            className="w-full whitespace-pre-line text-sm text-brand"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
