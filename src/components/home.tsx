import { sharedContactDetails } from "@/lib/contact-details";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "./site-icons";
export { Icon } from "./site-icons";
import { LoansMenu } from "./loans-menu";
import {
  sortVisible,
  youtubeId,
  sampleVideo,
  type Action,
  type Item,
  type Heading,
  type Photo,
  type Section,
  type Site,
} from "@/lib/content";
import { homeHighlights } from "@/lib/seed-content";
import { LanguageSwitch } from "./language-switch";
import { loanOptions } from "@/lib/site";
import { cleanRich } from "@/lib/rich";
import {
  Article,
  Carousel,
  EnquiryForm,
  FloatingActions,
  SiteLink,
  LinkButton,
  MobileNav,
  StatCounter,
  VideoPlayer,
} from "./site-interactions";
export function loanCardAction(loan: Item<"loans">): Action {
  return loan.cta.enquiry || loan.cta.url
    ? loan.cta
    : {
        ...loan.cta,
        url: "/" + loan.slug,
        label: loan.cta.label || "View loan details",
      };
}
export function Picture({
  photo,
  className = "",
  sizes,
  priority = false,
}: {
  photo: Photo;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  return photo.image ? (
    <Image
      src={photo.image}
      alt={photo.alt}
      fill
      sizes={sizes}
      className={"object-cover " + className}
      preload={priority}
    />
  ) : null;
}
function Logo({ photo }: { photo: Photo }) {
  return (
    <Link
      href="/"
      className="relative block h-11 w-24 shrink-0 md:h-14 md:w-32"
      aria-label="Home"
    >
      <Picture photo={photo} className="object-contain" sizes="128px" />
    </Link>
  );
}
export function Intro({
  data: d,
  center = false,
  breakHighlight = false,
}: {
  data: Heading;
  center?: boolean;
  breakHighlight?: boolean;
}) {
  return (
    <div
      className={
        center
          ? "mx-auto max-w-[690px] text-center [&_.eyebrow]:justify-center"
          : "max-w-[650px]"
      }
    >
      {d.eyebrow && <p className="eyebrow">{d.eyebrow}</p>}
      <h2 className="title">
        {d.heading}
        {d.highlight && (
          <>
            {breakHighlight ? <br /> : " "}
            <span className="text-brand">{d.highlight}</span>
          </>
        )}
      </h2>
      {d.description && <p className="copy mt-4">{d.description}</p>}
    </div>
  );
}
const gridCard =
  "min-w-0 shrink-0 basis-full sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]";
const bubble = "grid shrink-0 place-items-center rounded-xl";
const check =
  "grid size-5 shrink-0 place-items-center rounded-full bg-brand text-white";
export function SharedContactCards({
  site,
  officePath,
}: {
  site: Site;
  officePath?: string;
}) {
  return (
    <div className="mt-6 grid gap-3">
      {sharedContactDetails(site, officePath).map((item, i) => (
        <SiteLink
          key={item.icon}
          href={item.url}
          className="panel lift-card flex items-start gap-3 p-4 hover:border-navy/35"
        >
          <span
            className={
              "grid size-10 shrink-0 place-items-center rounded-lg " +
              (i % 2 ? "bg-softred text-brand" : "bg-softblue text-navy")
            }
          >
            <Icon name={item.icon} size={17} />
          </span>
          <span className="min-w-0">
            <strong className="block text-sm font-extrabold">
              {item.label}
            </strong>
            <span className="mt-1 block text-sm text-muted [overflow-wrap:anywhere]">
              {item.value}
            </span>
          </span>
        </SiteLink>
      ))}
    </div>
  );
}
type SectionViews = {
  [K in Section["type"]]: (
    section: Extract<Section, { type: K }>,
    site: Site,
    preview: boolean,
  ) => React.ReactNode;
};
const sectionViews: SectionViews = {
  custom({ id, content }) {
    return (
      <section id={id} className="band border-t border-rule bg-[#fff9f3]">
        <div className="wrap">
          <div className={content.photo.image ? "grid items-center gap-8 lg:grid-cols-2" : "max-w-3xl"}>
            <div>
              {content.icon && <span className="mb-4 inline-flex rounded-xl bg-softred p-3 text-brand"><Icon name={content.icon} /></span>}
              <Intro data={content} />
              {content.body && <div className="rich copy mt-4" dangerouslySetInnerHTML={{ __html: cleanRich(content.body) }} />}
              {content.cta.label && <div className="mt-5"><LinkButton action={content.cta} /></div>}
            </div>
            {content.photo.image && (
              <div className="relative aspect-video overflow-hidden rounded-2xl">
                <Picture photo={content.photo} sizes="(min-width:1024px) 42vw, 90vw" />
              </div>
            )}
          </div>
          {sortVisible(content.fields).length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortVisible(content.fields).map((field, index) => (
                <article key={index} className="panel p-5">
                  {field.icon && <span className="mb-3 inline-flex text-brand"><Icon name={field.icon} /></span>}
                  {field.label && <h3 className="font-extrabold">{field.label}</h3>}
                  {field.description && <p className="copy mt-2">{field.description}</p>}
                  {field.cta?.label && <div className="mt-3"><LinkButton action={field.cta} kind="text" /></div>}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  },
  bar(s) {
    const d = s.content;
    return (
      <div className="bg-navy text-white">
        <div className="wrap flex min-h-[34px] items-center justify-between gap-3 text-[11px] md:min-h-[39px] md:text-xs">
          <span className="flex items-center gap-1.5">
            <Icon name={d.icon} size={12} />
            {d.left}
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            {d.right}
            <LinkButton action={d.cta} kind="plain" />
          </span>
        </div>
      </div>
    );
  },
  header(s, site) {
    const d = s.content;
    const loans = sortVisible(site.records.loans).map(
      ({ slug, title, icon }) => ({ slug, title, icon }),
    );
    const nav = (mobile = false) =>
      sortVisible(d.items).map((item, index) =>
        d.loanMenu !== false &&
        !item.enquiry &&
        (item.url === (d.loanMenuUrl || "/services") ||
          ((!d.loanMenuUrl || d.loanMenuUrl === "/services") &&
            item.url === "#loans")) ? (
          <LoansMenu
            key={index}
            name={item.label}
            href={item.url === "#loans" ? "/services" : item.url}
            loans={loans}
            mobile={mobile}
          />
        ) : (
          <LinkButton
            key={index}
            action={item}
            kind="plain"
            navigation
            arrow={false}
          />
        ),
      );
    const buttons = (
      <>
        <LanguageSwitch />
        <LinkButton action={d.primary} />
      </>
    );
    return (
      <header className="border-b border-rule bg-white">
        <div className="wrap flex min-h-[72px] items-center justify-between gap-5 lg:min-h-[82px]">
          <Logo photo={d.logo} />
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-[clamp(.65rem,1.6vw,1.9rem)] text-[13px] lg:flex"
          >
            {nav()}
          </nav>
          <div className="hidden items-center gap-2.5 xl:gap-3 lg:flex">
            {buttons}
          </div>
          <MobileNav>
            <nav aria-label="Main navigation" className="grid gap-5">
              {nav(true)}
              <div className="grid gap-3">{buttons}</div>
            </nav>
          </MobileNav>
        </div>
      </header>
    );
  },
  hero(s) {
    const d = s.content;
    const slides = sortVisible(d.slides);
    const initial = Math.max(
      0,
      Math.min((d.initialSlide || 1) - 1, slides.length - 1),
    );
    return (
      slides.length > 0 && (
        <section
          aria-label="Financing options"
          className="public-hero reference-hero text-navy"
        >
          <Carousel
            count={slides.length}
            hero
            initial={initial}
            autoplay={d.autoplay}
            delay={d.delay}
          >
            {slides.map((item, index) => {
              const Title = index === initial ? "h1" : "h2";
              return (
                <div
                  key={index}
                  inert={index !== initial}
                  className="relative min-w-0 flex-[0_0_100%] overflow-hidden"
                >
                  <div className="reference-hero-photo"><Picture photo={item.photo.image === "/images/hero.jpg" ? { image: "/images/reference-hero.webp", alt: "Tailor beside her sewing machine" } : item.photo} sizes="64vw" priority={index === initial} /></div>
                  <div className="absolute inset-0 bg-[#fff9f0]" style={{ opacity: item.opacity }} />
                  <div className="hero-wash absolute inset-0" />
                  <div className="reference-hero-inner wrap relative flex flex-col">
                    <div className="reference-hero-copy">
                      {item.intro.eyebrow && <p className="eyebrow">{item.intro.eyebrow}</p>}
                      <Title className="hero-heading">{item.intro.heading === "Big Dreams Begin With" ? <>Big Dreams Begin<br />With</> : item.intro.heading} <span>{item.intro.highlight}</span></Title>
                      <p className="mt-5 max-w-[430px] text-[15px] leading-relaxed md:text-lg">{item.intro.description}</p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <LinkButton action={item.cta} />
                        <LinkButton action={item.advisorCta} kind="outline" />
                      </div>
                      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-bold">
                        {sortVisible(item.trust).slice(0, 3).map((t, i) => <li key={i} className="flex items-center gap-2"><Icon name={t.icon} size={17} />{t.label}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </Carousel>
        </section>
      )
    );
  },
  trust(s, site) {
    const d = s.content;
    if (site && s.id === "trust") {
      const loans = sortVisible(site.records.loans);
      const design = d.homeHighlights ?? homeHighlights;
      const featured = sortVisible(design.cards);
      const points = sortVisible(design.reasons);
      return (
        <div className="reference-below-hero">
          {!design.hideSupport && (
            <section className="need-band">
              <div className="need-wrap">
                <h2>{design.supportHeading}<span className="accent-stroke" /></h2>
                <div className="need-grid">
                  {featured.map((item, index) => (
                    <article className="need-card" key={index}>
                      {item.photo.image && (
                        <div className="need-image">
                          <Picture photo={item.photo} sizes="(min-width: 1024px) 18vw, 50vw" />
                          {item.icon && <span className="need-icon"><Icon name={item.icon} size={23} /></span>}
                        </div>
                      )}
                      <div className="need-copy">
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <LinkButton action={item.cta} kind="text" />
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
          {(!design.hideProducts || !design.hideEmi) && (
            <section className="product-band">
              <div className={"product-wrap" + (design.hideProducts ? " product-wrap-emi-only" : design.hideEmi ? " product-wrap-no-emi" : "")}>
                {!design.hideProducts && (
                  <>
                    <h2>{design.productsHeading}<span className="accent-stroke" /></h2>
                    <div className="product-grid">
                      {sortVisible(design.products).map(({ slug }, index) => {
                        const loan = loans.find((item) => item.slug === slug);
                        if (!loan) return null;
                        const action = loanCardAction(loan);
                        return (
                          <LinkButton key={index} action={{ ...action, label: loan.title }} kind="plain" className="product-tile">
                            <Icon name={loan.icon} size={27} />
                            <strong>{loan.title}</strong>
                            <span aria-hidden="true">→</span>
                          </LinkButton>
                        );
                      })}
                    </div>
                  </>
                )}
                {!design.hideEmi && (
                  <div className="emi-card">
                    <Icon name={design.emiIcon ?? "Calculator"} size={46} />
                    <div>
                      <h3>{design.emiTitle}</h3>
                      <p>{design.emiDescription}</p>
                      {design.emiLink && design.emiLabel && <Link href={design.emiLink} className="emi-link">{design.emiLabel} →</Link>}
                    </div>
                    {design.emiPhoto.image && <Image src={design.emiPhoto.image} alt={design.emiPhoto.alt} width={156} height={110} className="emi-photo" />}
                  </div>
                )}
              </div>
            </section>
          )}
          {!design.hideReasons && (
            <section className="why-band">
              <div className="why-wrap">
                <h2>{design.reasonsHeading}<span className="accent-stroke" /></h2>
                <div className="why-grid">
                  {points.map((item, index) => (
                    <div className="why-item" key={index}>
                      {item.icon && <Icon name={item.icon} size={34} />}
                      <span><strong>{item.label}</strong><small>{item.description}</small></span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      );
    }
    return (
      <div className="border-b border-rule bg-white py-4">
        <div className="wrap flex flex-col items-start gap-x-5 gap-y-3 text-[12px] sm:flex-row sm:flex-wrap sm:items-center lg:justify-between">
          <span className="font-bold text-muted sm:basis-full lg:basis-auto">
            {d.caption}
          </span>
          {sortVisible(d.items).map((item, i) => (
            <span key={i} className="flex items-center gap-2.5 font-extrabold">
              <span className={bubble + " size-8 bg-softred text-brand"}>
                <Icon name={item.icon} size={15} />
              </span>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    );
  },
  loans(s, site) {
    const r = site.records;
    return (
      <section id="loans" className="band">
        <div className="wrap">
          <Intro data={s.content} center breakHighlight />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {sortVisible(r.loans).map((item) => (
              <article
                key={item.slug}
                className="panel lift-card p-6 lg:p-[clamp(24px,2.1vw,34px)]"
              >
                {item.photo?.image && (
                  <div className="card-photo relative mb-4 aspect-video overflow-hidden rounded-lg bg-tint">
                    <Picture
                      photo={item.photo}
                      sizes="(min-width: 1024px) 30vw, 90vw"
                    />
                  </div>
                )}
                <div
                  className={
                    bubble +
                    " mb-4 size-[52px] " +
                    (item.red ? "bg-softred text-brand" : "bg-softblue")
                  }
                >
                  <Icon name={item.icon} size={21} />
                </div>
                <h3 className="mb-3 text-lg font-extrabold tracking-tight">
                  {item.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
                <LinkButton action={loanCardAction(item)} kind="text" />
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  },
  about(s) {
    const d = s.content;
    return (
      <section
        id="about"
        className="band story-section section-texture bg-tint"
      >
        <div className="wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-[6%]">
          <div className="relative mr-[12%]">
            <div className="story-photo relative aspect-[1.12] overflow-hidden rounded-[20px] bg-softblue shadow-[0_18px_40px_#09244b15]">
              <Picture photo={d.photo} sizes="(min-width: 1024px) 42vw, 90vw" />
            </div>
            <div className="absolute -right-[14%] bottom-0 max-w-[49%] rounded-[14px] bg-brand p-4 text-white shadow-[0_10px_28px_#c91e2338] md:p-6">
              <p className="text-[clamp(19px,2.8vw,38px)] leading-none font-extrabold tracking-tight">
                {d.badge}{" "}
                <span className="text-sm font-extrabold">{d.badgeAccent}</span>
              </p>
              <p className="mt-2 text-[13px] leading-relaxed">{d.badgeCopy}</p>
            </div>
          </div>
          <div>
            <Intro data={d} />
            <div
              className="rich copy mt-5"
              dangerouslySetInnerHTML={{ __html: cleanRich(d.body) }}
            />
            <ul className="my-6 grid gap-3 text-xs font-extrabold sm:grid-cols-2 md:text-sm">
              {sortVisible(d.features).map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className={check}>
                    <Icon name={item.icon} size={13} />
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
            <LinkButton action={d.cta} />
          </div>
        </div>
      </section>
    );
  },
  statistics(s, site, preview) {
    const d = s.content;
    const configured = preview
      ? d.items.slice().sort((a, b) => a.order - b.order)
      : sortVisible(d.items).filter((i) => i.verified);
    const items = configured.length
      ? configured
      : [
          {
            label: "Loan categories",
            value: String(sortVisible(site.records.loans).length),
          },
          {
            label: "Borrowing guides",
            value: String(sortVisible(site.records.blogs).length),
          },
          {
            label: "Common questions answered",
            value: String(sortVisible(site.records.faqs).length),
          },
        ].map((item) => ({ ...item, verified: true, prefix: "", suffix: "" }));
    return (
      <section
        id="statistics"
        className="band statistics-band bg-navy text-white"
      >
        <div className="statistics-waves" aria-hidden="true">
          <svg viewBox="0 0 1400 500" preserveAspectRatio="xMidYMid slice">
            {Array.from({ length: 13 }, (_, i) => (
              <path
                key={i}
                d="M-260 350 C 50 450 320 80 675 205 S 1050 460 1630 30"
                transform={`translate(0 ${i * 17 - 150})`}
              />
            ))}
          </svg>
        </div>
        <div className="wrap reference-section relative [&_.copy]:text-blue-100 [&_.eyebrow]:text-[#ff757d]">
          <Intro data={d} />
          {preview && items.some((i) => !i.verified) && (
            <p className="mt-3 text-sm text-blue-100">
              Draft figures for layout preview.
            </p>
          )}
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-6 lg:mt-12 lg:grid-cols-4 lg:gap-x-5">
            {items.map((item, i) => (
              <div
                key={i}
                className="border-l-2 border-brand px-3 py-5 sm:px-5 lg:py-8"
              >
                <p className="text-[clamp(26px,4.3vw,68px)] leading-none font-extrabold tracking-tight tabular-nums">
                  {item.prefix}
                  <StatCounter value={item.value} />
                  <span className="text-[#ff626c]">{item.suffix}</span>
                </p>
                <p className="mt-4 text-sm text-blue-100 lg:text-base">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
  videos(s, site, preview) {
    const r = site.records;
    const published = preview
      ? r.videos
      : sortVisible(r.videos).filter(
          (i) => sampleVideo(i.youtube) || youtubeId(i.youtube),
        );
    const items = published.length
      ? published
      : [
          "Understanding your loan options",
          "Plan your next financial step",
          "Your questions, answered",
        ].map((title) => ({
          title,
          description: "Video coming soon",
          youtube: "",
          thumbnail: { image: "", alt: "" },
        }));
    return (
      <section id="videos" className="band">
        <div className="wrap">
          <Intro data={s.content} />
          <div className="mt-8 grid gap-4 md:grid-cols-3 lg:gap-5">
            {items.map((item, i) => (
              <article
                key={i}
                className="panel overflow-hidden shadow-[0_10px_24px_#09244b09]"
              >
                <VideoPlayer
                  video={youtubeId(item.youtube)}
                  sample={sampleVideo(item.youtube) ? item.youtube : undefined}
                  title={item.title}
                >
                  <Picture
                    photo={item.thumbnail}
                    sizes="(min-width: 768px) 33vw, 90vw"
                  />
                  {!item.thumbnail.image && !item.youtube && (
                    <span className="absolute inset-0 grid place-items-center text-sm text-blue-100">
                      Video awaiting approval
                    </span>
                  )}
                </VideoPlayer>
                <div className="p-5">
                  {sampleVideo(item.youtube) && (
                    <p className="mb-2 text-xs font-semibold text-muted">
                      Sample video
                    </p>
                  )}
                  <h3 className="font-extrabold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  },
  testimonials(s, site) {
    const r = site.records;
    const items = sortVisible(r.testimonials).filter(
      (i) => i.example || i.consent,
    );
    return (
      <section id="stories" className="band bg-tint">
        <div className="wrap reference-section">
          <div className="[&>div]:max-w-none">
            <Intro data={s.content} />
          </div>
          <div className="mt-10 lg:mt-12">
            <Carousel count={items.length || 3} caption={s.content.caption}>
              {items.length
                ? items.map((item) => (
                    <article
                      key={item.slug}
                      className={gridCard + " panel rounded-[20px] p-6 lg:p-7"}
                    >
                      <div
                        className="mb-5 flex gap-1 text-[19px] leading-none text-[#ef9b20]"
                        role="img"
                        aria-label={item.rating + " out of 5 stars"}
                      >
                        {Array.from({ length: item.rating }, (_, i) => (
                          <span key={i} aria-hidden="true">
                            ★
                          </span>
                        ))}
                      </div>
                      <blockquote className="border-l-[4px] border-ink pl-4 text-[15px] leading-relaxed text-muted lg:text-base">
                        <q>{item.review}</q>
                      </blockquote>
                      <div className="mt-6 flex items-center gap-3">
                        <span className="relative grid size-12 place-items-center overflow-hidden rounded-full bg-softblue text-base font-extrabold">
                          {item.avatar.image ? (
                            <Picture photo={item.avatar} sizes="48px" />
                          ) : (
                            item.name
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((v) => v[0])
                              .join("")
                          )}
                        </span>
                        <div>
                          <h3 className="text-sm font-extrabold">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted">
                            {item.designation}
                            {item.example &&
                              (item.designation
                                ? " · Demo"
                                : "Demo testimonial")}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
                : Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className={
                        gridCard +
                        " panel flex min-h-40 items-center p-6 text-sm text-muted"
                      }
                    >
                      Customer story awaiting approval
                    </div>
                  ))}
            </Carousel>
          </div>
        </div>
      </section>
    );
  },
  blogs(s, site) {
    const r = site.records;
    const items = sortVisible(r.blogs).filter(
      (i) => !i.date || i.date <= new Date().toISOString().slice(0, 10),
    );
    if (!items.length) return null;
    return (
      <section id="insights" className="band">
        <div className="wrap">
          <Intro data={s.content} />
          <div className="mt-8">
            <Carousel count={items.length} caption={s.content.caption}>
              {items.map((item) => (
                <article
                  key={item.slug}
                  className={gridCard + " panel lift-card overflow-hidden"}
                >
                  <div className="relative aspect-video bg-softblue">
                    <Picture
                      photo={item.photo}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
                    />
                  </div>
                  <div className="p-5">
                    <p className="mb-2 text-[11px] font-semibold uppercase text-muted">
                      {item.category} · {item.minutes} min read
                    </p>
                    <h3 className="text-lg leading-tight font-extrabold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-3 mb-4 text-sm leading-relaxed text-muted">
                      {item.excerpt}
                    </p>
                    {item.body && (
                      <Article
                        title={item.title}
                        body={
                          <div
                            className="rich copy"
                            dangerouslySetInnerHTML={{
                              __html: cleanRich(item.body),
                            }}
                          />
                        }
                      />
                    )}
                  </div>
                </article>
              ))}
            </Carousel>
          </div>
        </div>
      </section>
    );
  },
  faqs(s, site) {
    const r = site.records;
    const d = s.content;
    return (
      <section id="faqs" className="band bg-tint">
        <div className="wrap grid gap-8 lg:grid-cols-[.6fr_1fr] lg:gap-[5.5%]">
          <div>
            <div className="lg:max-w-[420px]">
              <Intro data={d} />
            </div>
            <div className="mt-5 rounded-[15px] bg-navy p-6 text-white">
              <h3 className="font-extrabold">{d.supportTitle}</h3>
              <p className="my-3 text-sm leading-relaxed text-blue-100">
                {d.supportCopy}
              </p>
              <LinkButton action={d.cta} />
            </div>
          </div>
          <div className="border-t border-rule">
            {sortVisible(r.faqs).map((item, i) => (
              <details
                key={i}
                name="loan-faq"
                open={i === 0}
                className="group border-b border-rule"
              >
                <summary className="flex min-h-16 list-none items-center justify-between gap-4 py-4 text-[15px] font-extrabold hover:text-brand">
                  {item.question}
                  <span
                    aria-hidden
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-softblue text-brand"
                  >
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:block">−</span>
                  </span>
                </summary>
                <p className="pb-5 pr-5 text-sm leading-relaxed text-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  },
  contact(s, site) {
    const { recipient, ...d } = s.content;
    void recipient;
    return (
      <section id="contact" className="band bg-tint">
        <div className="wrap grid grid-cols-1 items-start gap-8 lg:grid-cols-[.67fr_1fr] lg:gap-[5%]">
          <div>
            <Intro data={d} />
            <SharedContactCards site={site} />
          </div>
          <div className="panel p-5 shadow-[0_14px_35px_#0626530b] sm:p-7 lg:flex lg:self-stretch xl:p-8">
            <EnquiryForm config={d} options={loanOptions(site)} stretch />
          </div>
        </div>
      </section>
    );
  },
  banner(s) {
    const d = s.content;
    return (
      <section className="bg-brand py-8 text-white md:py-9">
        <div className="wrap flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[clamp(24px,2.75vw,38px)] leading-tight font-extrabold tracking-[-.045em]">
              {d.heading}
            </h2>
            <p className="mt-2 text-sm md:text-base">{d.description}</p>
          </div>
          <LinkButton action={d.cta} kind="white" />
        </div>
      </section>
    );
  },
  footer(s, site) {
    const d = s.content;
    const headerLogo = site.sections.find(
      (section) => section.type === "header",
    )?.content.logo;
    const contacts = [
      ...sharedContactDetails(site).map((item) => ({ ...item, label: "" })),
      ...sortVisible(d.contactFields || []),
    ];
    return (
      <footer
        id="site-footer"
        className="relative border-t-4 border-brand bg-ink pt-11 pb-16 text-blue-100 sm:pb-0 md:pt-16"
      >
        <div className="wrap">
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-7 lg:grid-cols-[1.48fr_.88fr_1fr_1.09fr]">
            <div className="col-span-2 min-w-0 lg:col-span-1">
              <Link
                href="/"
                aria-label="Home"
                className={
                  "relative block h-[57px] w-32 rounded-lg" +
                  (headerLogo?.image ? " bg-white" : "")
                }
              >
                <Picture
                  photo={headerLogo?.image ? headerLogo : d.logo}
                  className="object-contain p-1.5"
                  sizes="128px"
                />
              </Link>
              <p className="mt-4 max-w-[330px] text-sm leading-relaxed md:text-base">
                {d.description}
              </p>
              <ul
                className="mt-5 flex flex-wrap gap-2"
                aria-label="Social profiles"
              >
                {sortVisible(d.socials).map((social, i) => {
                  const style =
                    "grid size-10 place-items-center rounded-full border border-blue-100/25 text-white transition-colors hover:border-white/60 hover:bg-white/10";
                  return (
                    <li key={i}>
                      {social.url ? (
                        <SiteLink
                          href={social.url}
                          className={style}
                          aria-label={social.label}
                        >
                          <Icon name={social.icon || "Globe"} size={16} />
                        </SiteLink>
                      ) : (
                        <span
                          className={style}
                          title={social.label + " profile to be confirmed"}
                        >
                          <Icon name={social.icon || "Globe"} size={16} />
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
            {d.columns.map((col, i) => (
              <div key={i} className="min-w-0 break-words">
                <h2 className="mb-4 text-base font-extrabold text-white md:text-lg">
                  {col.title}
                </h2>
                {col.description && (
                  <p className="mb-3 whitespace-pre-line break-words text-sm leading-relaxed md:text-base">
                    {col.description}
                  </p>
                )}
                <ul className="grid gap-2.5 text-sm md:text-base [&_a]:font-normal [&_button]:font-normal">
                  {sortVisible(col.links).map((link, j) => (
                    <li key={j}>
                      {link.enquiry || link.url ? (
                        <LinkButton action={link} kind="plain" arrow={false} />
                      ) : (
                        <span>{link.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 min-w-0 lg:col-span-1">
              <h2 className="mb-4 text-base font-extrabold text-white md:text-lg">
                {d.contactTitle}
              </h2>
              <ul className="grid gap-3 text-sm md:text-base">
                {contacts.map(
                  (item, i) =>
                    (item.value || item.label) && (
                      <li key={i} className="flex min-w-0 items-start gap-2.5">
                        <span className="mt-1 shrink-0">
                          <Icon name={item.icon} size={15} />
                        </span>
                        <span className="min-w-0 break-words">
                          {item.label && (
                            <strong className="mr-1 text-white">
                              {item.label}
                            </strong>
                          )}
                          {item.url ? (
                            <SiteLink
                              href={item.url}
                              className="hover:text-white hover:underline"
                            >
                              {item.value}
                            </SiteLink>
                          ) : (
                            item.value
                          )}
                        </span>
                      </li>
                    ),
                )}
              </ul>
            </div>
          </div>
          <div className="mt-10 grid gap-3 border-t border-white/15 py-5 text-xs text-blue-100/80 md:grid-cols-[1.15fr_1fr_1.15fr] md:items-center md:text-sm">
            <p>
              {d.copyright.replaceAll(
                "{year}",
                String(new Date().getFullYear()),
              )}
            </p>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 md:justify-center">
              {sortVisible(d.legal).map(
                (item, i) =>
                  item.label && (
                    <li key={i}>
                      {item.url || item.enquiry ? (
                        <LinkButton action={item} kind="plain" arrow={false} />
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </li>
                  ),
              )}
            </ul>
            <p className="md:text-right">{d.note}</p>
          </div>
        </div>
      </footer>
    );
  },
};
export function renderSection(section: Section, site: Site, preview: boolean) {
  const view = sectionViews[section.type] as (
    section: Section,
    site: Site,
    preview: boolean,
  ) => React.ReactNode;
  return view(section, site, preview);
}
export function Home({
  site,
  preview = false,
}: {
  site: Site;
  preview?: boolean;
}) {
  const whatsapp = site.settings.whatsapp;
  const display = site.sections.filter((s) => s.visible);
  const stories = display.some((s) => s.type === "testimonials");
  const storyLink = <T extends { url: string }>(item: T): T =>
    item.url === "#stories" && !stories ? { ...item, url: "#about" } : item;
  const header = display.filter((s) => s.type === "bar" || s.type === "header");
  const content = display.filter((s) => s.type !== "bar" && s.type !== "header" && s.type !== "footer");
  const footer = display.filter((s) => s.type === "footer");
  const render = (section: Section) => (
    <div key={section.id} className="contents" data-section={section.type}>
      {renderSection(
        section.type === "header"
          ? {
              ...section,
              content: {
                ...section.content,
                items: section.content.items.map(storyLink),
              },
            }
          : section.type === "footer"
            ? {
                ...section,
                content: {
                  ...section.content,
                  columns: section.content.columns.map((c) => ({
                    ...c,
                    links: c.links.map(storyLink),
                  })),
                },
              }
            : section,
        site,
        preview,
      )}
    </div>
  );
  return (
    <div id="home" className="public-site">
      <a
        className="sr-only z-50 focus:not-sr-only focus:absolute focus:bg-white focus:p-3"
        href="#main"
      >
        Skip to content
      </a>
      {header.map(render)}
      <main id="main">
        {!display.some(
          (s) => s.type === "hero" && s.content.slides.some((i) => i.visible),
        ) && <h1 className="sr-only">{site.settings.websiteName}</h1>}
        {content.map(render)}
      </main>
      {footer.map(render)}
      <FloatingActions
        whatsapp={whatsapp}
        backToTop={
          site.sections.find((section) => section.type === "footer")?.content
            .backToTop !== false
        }
      />
    </div>
  );
}
