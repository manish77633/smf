import { businessDetails, sharedContactDetails } from "@/lib/contact-details";
import Link from "next/link";
import {
  Icon,
  SharedContactCards,
  Intro,
  Picture,
  loanCardAction,
  renderSection,
} from "@/components/home";
import {
  EnquiryForm,
  FloatingActions,
  LinkButton,
} from "@/components/site-interactions";
import { sortVisible, type Site, type Action } from "@/lib/content";
import { loanOptions } from "@/lib/site";
import { cleanRich } from "@/lib/rich";
import { emptyBlock, type EditablePage, type PageBlock } from "@/lib/pages";
import { isLoanService, loanOverviewPhoto, pageHeroPhoto, serviceCardPhoto } from "@/lib/section-media";
import { serviceCatalog } from "@/lib/service-catalog";
import HeroPhoto from "./hero-photo";
import "./services-page.css";
import "./loan-hero.css";

function Block({
  block: b,
  site,
  primary,
  pageSlug,
}: {
  block: PageBlock;
  site: Site;
  primary: boolean;
  pageSlug: string;
}) {
  const d = b.intro,
    items = sortVisible(b.items);
  const cta = <LinkButton action={b.cta} />;
  if (b.type === "custom")
    return renderSection({
      id: `custom-${b.id}`,
      type: "custom",
      visible: b.visible,
      label: b.label,
      content: {
        ...b.intro,
        icon: b.icon,
        body: b.body,
        photo: b.photo,
        cta: b.cta,
        fields: b.fields ?? [],
      },
    }, site, false);
  if (b.type === "breadcrumb")
    return (
      <nav aria-label="Breadcrumb" className="border-b border-rule">
        <div className="wrap flex items-center gap-3 py-4 text-xs">
          <Link className="font-bold" href="/">
            {b.cardTitle}
          </Link>
          <span aria-hidden>/</span>
          {b.cta.label && b.cta.url && !b.cta.enquiry && (
            <>
              <Link className="font-bold hover:underline" href={b.cta.url}>
                {b.cta.label}
              </Link>
              <span aria-hidden>/</span>
            </>
          )}
          <span aria-current="page" className="text-muted">
            {b.cardCopy}
          </span>
        </div>
      </nav>
    );
  if (b.type === "hero") {
    const Title = primary ? "h1" : "h2";
    const photo = pageHeroPhoto(pageSlug, b.photo);
    const loanHero = isLoanService(pageSlug);
    return (
      <section className={`public-hero detail-hero relative isolate overflow-hidden${loanHero ? " loan-hero" : ""}`}>
        <HeroPhoto photo={photo} mobile={b.mobilePhoto} className="detail-hero-photo" priority={primary} fullWidth={loanHero} />
        <div className="public-hero-inner wrap detail-hero-inner relative py-[clamp(48px,5vw,76px)]">
          <div>
            <p className="eyebrow text-[#ff747b]">{d.eyebrow}</p>
            <Title className="hero-heading max-w-[760px]">
              {d.heading} <span>{d.highlight}</span>
            </Title>
            <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-ink md:text-lg">
              {d.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {b.cta.label && cta}
              {loanHero && b.secondaryAction && <LinkButton action={b.secondaryAction} kind="outline" />}
            </div>
          </div>
          {(b.cardTitle || b.cardCopy) && (
            <aside className="mt-6 max-w-md rounded-xl border border-rule bg-white/80 p-4">
              <span className="mb-4 grid size-10 place-items-center rounded-xl bg-brand">
                <Icon name={b.icon} size={18} />
              </span>
              <h2 className="font-extrabold">{b.cardTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                {b.cardCopy}
              </p>
            </aside>
          )}
        </div>
      </section>
    );
  }
  if (b.type === "contactForm") {
    const shared = site.sections.find(
      (section) => section.type === "contact",
    )?.content;
    const config = shared
      ? (({ recipient, ...copy }) => {
          void recipient;
          return { ...copy, ...b.form };
        })(shared)
      : undefined;
    return (
      <section className="band" id="contact">
        <div className="wrap grid grid-cols-1 items-start gap-8 lg:grid-cols-[.7fr_1fr] lg:gap-[4%]">
          <div>
            <Intro data={d} />
            <SharedContactCards site={site} officePath="#office-location" />
            {b.note && (
              <p className="mt-3 border-l border-brand bg-tint p-3 text-xs leading-relaxed text-muted">
                {b.note}
              </p>
            )}
          </div>
          {config && (
            <div className="panel p-5 shadow-[0_12px_35px_#0626530c] md:p-7 lg:flex lg:flex-col lg:self-stretch">
              {b.cardTitle && <p className="eyebrow">{b.cardTitle}</p>}
              <EnquiryForm
                config={config}
                options={loanOptions(site)}
                source="contact-page"
                stretch
                wideButton
              />
            </div>
          )}
        </div>
      </section>
    );
  }
  if (b.type === "officeMap") {
    const address = businessDetails(site).address.trim();
    const office = sharedContactDetails(site).find(
      (item) => item.icon === "MapPin",
    );
    const mapUrl =
      b.mapUrl ||
      (address
        ? "https://www.google.com/maps?q=" +
          encodeURIComponent(address) +
          "&output=embed"
        : "");
    const directions =
      address && b.cta.enquiry && b.cta.label === "Ask for Directions" && office
        ? { ...b.cta, label: "Get directions", url: office.url, enquiry: false }
        : b.cta;
    return (
      <section id="office-location" className="band bg-tint">
        <div className="wrap">
          <Intro data={d} />
          <div className="panel mt-7 overflow-hidden shadow-[0_12px_35px_#0626530c]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-5 py-4">
              <div>
                <h3 className="font-extrabold">{b.cardTitle}</h3>
                <p className="mt-1 text-sm text-muted">
                  {address || "Office address to be confirmed"}
                </p>
              </div>
              <LinkButton action={directions} kind="outline" />
            </div>
            {mapUrl ? (
              <iframe
                title={b.cardTitle || "Office map"}
                src={mapUrl}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="block h-[clamp(250px,29vw,440px)] w-full border-0"
                allowFullScreen
              />
            ) : (
              <div className="grid min-h-[clamp(250px,29vw,440px)] place-items-center bg-gradient-to-br from-softblue to-rule p-5 text-center">
                <div className="max-w-sm">
                  <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-brand text-white shadow-lg">
                    <Icon name={b.icon} size={20} />
                  </span>
                  <h4 className="font-extrabold">{b.fallbackTitle}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {b.note}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
  if (b.type === "services") {
    const rows = serviceCatalog(b, site.records.loans);
    return (
      <section className="band service-catalog" id="loan-categories">
        <div className="wrap">
          <div className="mb-5 grid items-end gap-5 lg:grid-cols-[1fr_25%]">
            <Intro data={d} />
            {b.note && (
              <p className="border-l border-brand pl-4 text-sm leading-relaxed text-muted">
                {b.note}
              </p>
            )}
          </div>
          <div className="service-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {rows.map((loan, i) => {
              const photo = serviceCardPhoto(loan.slug, loan.photo);
              return (
                <article
                  key={loan.slug + "-" + i}
                  className="service-product panel lift-card flex flex-col overflow-hidden"
                >
                  {photo.image && (
                    <div className="service-product-photo card-photo relative aspect-video overflow-hidden bg-tint">
                      <Picture
                        photo={photo}
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                      />
                    </div>
                  )}
                  <div className="service-product-content flex flex-1 flex-col p-6">
                    <span
                      className={
                        "service-product-icon mb-4 grid size-12 place-items-center rounded-xl " +
                        (loan.red ? "bg-softred text-brand" : "bg-softblue")
                      }
                    >
                      <Icon name={loan.icon} />
                    </span>
                    <h3 className="text-lg font-extrabold">{loan.title}</h3>
                    <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">
                      {loan.description}
                    </p>
                    <div className="mt-auto">
                      <LinkButton action={loanCardAction(loan)} kind="text" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
  if (b.type === "guidance")
    return (
      <section className="band bg-navy text-white">
        <div className="wrap grid items-center gap-8 lg:grid-cols-[.8fr_1fr] lg:gap-[7%]">
          <div className="[&_.copy]:text-blue-100 [&_.eyebrow]:text-[#ff747b]">
            <Intro data={d} />
            <div className="mt-5">{cta}</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item, i) => (
              <article
                key={i}
                className="flex gap-3 rounded-xl border border-white/15 bg-white/5 p-4"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand">
                  <Icon name={item.icon} size={14} />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-blue-100">
                    {item.description}
                  </p>
                  {item.cta?.label && <div className="mt-2"><LinkButton action={item.cta} kind="plain" /></div>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  if (b.type === "overview") {
    const photo = loanOverviewPhoto(pageSlug, b.photo);
    return (
      <section className="band">
        <div className="wrap grid items-center gap-9 lg:grid-cols-[1.25fr_1fr] lg:gap-[5%]">
          <div>
            <Intro data={d} />
            <div
              className="rich copy mt-4"
              dangerouslySetInnerHTML={{ __html: cleanRich(b.body) }}
            />
            {b.cta.label && <div className="mt-5">{cta}</div>}
          </div>
          {photo.image && (
            <figure className="relative">
              <div className="relative aspect-[1.28] overflow-hidden rounded-2xl shadow-[0_14px_45px_#06265320]">
                <Picture
                  photo={photo}
                  sizes="(min-width:1024px) 42vw, 90vw"
                />
              </div>
              {(b.cardTitle || b.cardCopy) && (
                <figcaption className="absolute bottom-4 left-3 rounded-xl bg-brand p-4 text-white shadow-lg lg:-left-4">
                  <p className="font-extrabold">{b.cardTitle}</p>
                  <p className="mt-1 text-sm">{b.cardCopy}</p>
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </section>
    );
  }
  if (b.type === "highlights")
    return (
      <section className="band bg-tint">
        <div className="wrap">
          <Intro data={d} center />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <article className="panel p-6" key={i}>
                <span
                  className={
                    "mb-4 grid size-10 place-items-center rounded-xl " +
                    (i % 2 ? "bg-softred text-brand" : "bg-softblue text-navy")
                  }
                >
                  <Icon name={item.icon} size={18} />
                </span>
                <h3 className="font-extrabold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
                {item.cta?.label && <div className="mt-3"><LinkButton action={item.cta} kind="text" /></div>}
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  if (b.type === "checklist")
    return (
      <section className="band">
        <div className="wrap grid items-start gap-8 lg:grid-cols-[.85fr_1fr] lg:gap-[6%]">
          <Intro data={d} />
          <ul className="grid gap-3">
            {items.map((item, i) => (
              <li key={i} className="panel flex gap-3 p-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-softred text-brand">
                  <Icon name={item.icon} size={14} />
                </span>
                <div>
                  <p className="text-sm leading-relaxed text-muted">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-xs text-muted">
                      {item.description}
                    </p>
                  )}
                  {item.cta?.label && <div className="mt-2"><LinkButton action={item.cta} kind="text" /></div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  if (b.type === "notice")
    return (
      <section className="bg-tint py-12 md:py-20">
        <aside className="wrap panel flex items-start gap-4 p-5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-softred text-brand">
            <Icon name={b.icon} size={16} />
          </span>
          <div>
            <h2 className="text-sm font-extrabold">{b.cardTitle}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {b.cardCopy}
            </p>
          </div>
        </aside>
      </section>
    );
  if (b.type === "steps")
    return (
      <section
        className={
          "band story-section section-texture" +
          (b.dark ? " bg-navy text-white" : " bg-tint")
        }
      >
        <div
          className={
            "wrap" +
            (b.dark
              ? " [&_.copy]:text-blue-100 [&_.eyebrow]:text-[#ff747b]"
              : "")
          }
        >
          <Intro data={d} center breakHighlight />
          <div className="story-steps mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <article
                key={i}
                className={
                  b.dark
                    ? "rounded-xl border border-white/20 bg-white/5 p-6"
                    : "panel p-6"
                }
              >
                <span
                  className={
                    "mb-4 grid size-9 place-items-center rounded-xl text-sm font-bold " +
                    (b.dark ? "bg-brand text-white" : "bg-softred text-brand")
                  }
                >
                  {item.icon ? <Icon name={item.icon} size={16} /> : i + 1}
                </span>
                <h3 className="font-extrabold">{item.title}</h3>
                <p
                  className={
                    "mt-2 text-sm leading-relaxed " +
                    (b.dark ? "text-blue-100" : "text-muted")
                  }
                >
                  {item.description}
                </p>
                {item.cta?.label && (
                  <div className="mt-3">
                    <LinkButton action={item.cta} kind={b.dark ? "plain" : "text"} />
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  if (b.type === "questions")
    return (
      <section className="band bg-tint">
        <div className="wrap grid gap-8 lg:grid-cols-[.65fr_1fr] lg:gap-[6%]">
          <div>
            <Intro data={d} />
            <div className="mt-5 rounded-2xl bg-navy p-6 text-white">
              <h3 className="font-extrabold">{b.cardTitle}</h3>
              <p className="my-3 text-sm leading-relaxed text-blue-100">
                {b.cardCopy}
              </p>
              {cta}
            </div>
          </div>
          <div className="border-t border-rule">
            {items.map((item, i) => (
              <details
                key={i}
                name={b.id}
                open={i === 0}
                className="group border-b border-rule"
              >
                <summary className="flex list-none items-center justify-between gap-3 py-5 text-sm font-extrabold">
                  <span className="flex items-center gap-2">
                    {item.icon && <Icon name={item.icon} size={16} />}
                    {item.title}
                  </span>
                  <span
                    aria-hidden
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-softblue text-brand"
                  >
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:block">−</span>
                  </span>
                </summary>
                <p className="pb-5 pr-4 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
                {item.cta?.label && <div className="pb-4"><LinkButton action={item.cta} kind="text" /></div>}
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  return (
    <section className="band">
      <div className="wrap">
        <Intro data={d} />
        <div
          className="rich copy mt-5"
          dangerouslySetInnerHTML={{ __html: cleanRich(b.body) }}
        />
        <div className="mt-5">{cta}</div>
      </div>
    </section>
  );
}
export function ContentPage({
  page,
  site,
  children,
}: {
  page: EditablePage;
  site: Site;
  children?: React.ReactNode;
}) {
  const link = <T extends Action>(action: T): T =>
    action.url.startsWith("#") && !action.enquiry
      ? {
          ...action,
          url:
            action.url === "#loans"
              ? "/services"
              : "/" +
                (action.url === "#stories" &&
                !site.sections.some(
                  (section) =>
                    section.type === "testimonials" && section.visible,
                )
                  ? "#about"
                  : action.url),
        }
      : action;
  const sections = page.sections.filter((s) => s.visible);
  const hero = sections.find((s) => s.type === "hero");
  const shell = site.sections
    .filter((s) => s.visible)
    .map((s) => {
      if (s.type === "header")
        return {
          ...s,
          content: {
            ...s.content,
            primary: link(s.content.primary),
            outline: link(s.content.outline),
            items: s.content.items.map(link),
          },
        };
      if (s.type === "bar")
        return { ...s, content: { ...s.content, cta: link(s.content.cta) } };
      if (s.type === "banner")
        return { ...s, content: { ...s.content, cta: link(s.content.cta) } };
      if (s.type === "footer")
        return {
          ...s,
          content: {
            ...s.content,
            columns: s.content.columns.map((c) => ({
              ...c,
              links: c.links.map(link),
            })),
            legal: s.content.legal.map(link),
            socials: s.content.socials.map(link),
          },
        };
      return s;
    });
  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:p-3"
        href="#main"
      >
        Skip to content
      </a>
      {shell
        .filter((s) => s.type === "bar" || s.type === "header")
        .map((s) => (
          <div key={s.id} className="contents">
            {renderSection(s, site, false)}
          </div>
        ))}
      <main id="main" className={page.slug === "services" ? "public-site services-page" : "public-site"}>
        {!hero && (
          <Block
            block={{
              ...emptyBlock("hero", page.slug),
              intro: { eyebrow: "", heading: page.title, highlight: "", description: "" },
            }}
            site={site}
            primary
            pageSlug={page.slug}
          />
        )}
        {sections.map((s) => {
          const extraButton = !(s.type === "hero" && isLoanService(page.slug)) && s.secondaryAction?.label &&
            (s.secondaryAction.url || s.secondaryAction.enquiry);
          if (s.spacing !== "extra" && !extraButton) {
            return <Block key={s.id} block={s} site={site} primary={s === hero} pageSlug={page.slug} />;
          }
          return (
            <div key={s.id} className={s.spacing === "extra" ? "py-6 sm:py-10" : "contents"}>
              <Block block={s} site={site} primary={s === hero} pageSlug={page.slug} />
              {extraButton && s.secondaryAction && (
                <div className="wrap pb-6">
                  <LinkButton action={s.secondaryAction} kind="outline" />
                </div>
              )}
            </div>
          );
        })}
        {children}
      </main>
      {[
        ...shell.filter((s) => s.type === "banner"),
        ...shell.filter((s) => s.type === "footer"),
      ].map((s) => (
        <div key={s.id} className="contents">
          {renderSection(s, site, false)}
        </div>
      ))}
      <FloatingActions
        whatsapp={site.settings.whatsapp}
        backToTop={
          site.sections.find((section) => section.type === "footer")?.content
            .backToTop !== false
        }
      />
    </>
  );
}
