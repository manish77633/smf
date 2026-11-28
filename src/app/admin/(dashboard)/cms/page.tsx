import { bundledMedia } from "@/lib/bundled-media";
import { redirect } from "next/navigation";
import { adminEmail } from "@/auth";
import Editor from "@/components/cms-editor";
import LinkDestinations from "@/components/link-destinations";
import { getDraft, getSite } from "@/lib/site";
import { Media, Page } from "@/lib/db";
import { sortVisible } from "@/lib/content";
import { homeHeroPhoto, mobileHeroPhoto } from "@/lib/section-media";
import PublishedHeroImages from "@/components/published-hero-images";
export default async function CMS({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  if (!(await adminEmail())) redirect("/admin/login");
  const { tab } = await searchParams;
  const [initial, list, pages, published] = await Promise.all([
    getDraft(),
    Media.find({ deleting: { $ne: true } })
      .sort({ createdAt: -1 })
      .select("url alt -_id")
      .lean<{ url: string; alt: string }[]>(),
    Page.find({ key: /^page:/ })
      .sort({ "draft.title": 1 })
      .select("key draft.title -_id")
      .lean<{ key: string; draft: { title: string } }[]>(),
    !tab || tab === "overview" || tab === "hero" ? getSite() : null,
  ]);
  const publishedHeroImages = published?.page.status === "published"
    ? published.sections.flatMap((section) => section.type === "hero" && section.visible
      ? sortVisible(section.content.slides).flatMap((slide, index) => {
          const key = section.id + "-" + index;
          const label = slide.intro.heading || "Slide " + (index + 1);
          const photo = homeHeroPhoto(slide.photo);
          const mobile = mobileHeroPhoto(photo, slide.mobilePhoto);
          return [{ key, label, photo }, ...(mobile
            ? [{ key: key + "-mobile", label: label + " (mobile)", photo: mobile }]
            : [])];
        })
      : [])
    : [];
  initial.records.loans.sort((a, b) => a.order - b.order);
  return (
    <>
      <LinkDestinations
        pages={pages.map(({ key, draft }) => ({ slug: key.slice(5), title: draft.title }))}
      />
      <Editor
        key={tab || "overview"}
        tab={tab || "overview"}
        initial={initial}
        media={[...list, ...bundledMedia]}
        loanPageSlugs={pages.map((page) => page.key.slice(5))}
        publishedImages={<PublishedHeroImages images={publishedHeroImages} />}
      />
    </>
  );
}
