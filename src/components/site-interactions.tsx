"use client";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
  type ComponentPropsWithoutRef,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  Menu,
  Play,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { z } from "zod";
import {
  enquirySchema,
  type Action,
  type Content,
  type Settings,
} from "@/lib/content";
type Source = z.input<typeof enquirySchema>["source"];
type Options = { value: string; label: string }[];
export type FormCopy = Omit<Content<"contact">, "recipient">;
const companyEnquiryUrl = "https://smfincorplead.ditionline.com/";
type SiteLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
};
export function SiteLink({ href, ...props }: SiteLinkProps) {
  if (["#contact", "/#contact", "/contact#contact"].includes(href))
    href = companyEnquiryUrl;
  if (href === companyEnquiryUrl)
    return (
      <a {...props} href={href} target="_blank" rel="noopener noreferrer" />
    );
  return /^\/(?!\/)/.test(href) && !props.download ? (
    <Link href={href} {...props} />
  ) : (
    <a href={href} {...props} />
  );
}
export function LinkButton({
  action,
  kind = "primary",
  arrow = true,
  navigation = false,
}: {
  action: Action;
  kind?: "primary" | "outline" | "white" | "text" | "plain";
  arrow?: boolean;
  navigation?: boolean;
}) {
  const pathname = usePathname();
  const url =
    action.enquiry || /^apply\b/i.test(action.label.trim())
      ? companyEnquiryUrl
      : action.url;
  const current = navigation && url === pathname;
  const parent =
    navigation && url === "/services" && pathname === "/business-loan";
  if (!action.label || !url) return null;
  const style = {
    primary: "button",
    outline:
      "button border border-navy/40 bg-white text-navy shadow-none hover:bg-tint",
    white: "button bg-white text-brand shadow-none hover:bg-softred",
    text: "inline-flex items-center gap-2 text-sm font-extrabold text-brand hover:underline",
    plain: "inline-flex items-center gap-1 font-bold hover:underline",
  }[kind];
  const label = (
    <>
      {action.label}
      {arrow &&
        (kind === "text" ? (
          <ArrowRight size={13} />
        ) : (
          <ArrowUpRight size={14} />
        ))}
    </>
  );
  return (
    <SiteLink
      className={style + (current || parent ? " text-brand" : "")}
      href={url}
      aria-current={current ? "page" : undefined}
    >
      {label}
    </SiteLink>
  );
}
function WhatsAppMark() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2a9.8 9.8 0 0 0-8.54 14.62L2 22l5.52-1.45A9.8 9.8 0 1 0 12 2Zm0 17.94a8.1 8.1 0 0 1-4.1-1.11l-.3-.18-3.27.86.87-3.19-.2-.32A8.12 8.12 0 1 1 12 19.94Zm4.45-6.08c-.24-.12-1.44-.71-1.67-.79-.22-.08-.38-.12-.54.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.02-.37-1.94-1.19a7.27 7.27 0 0 1-1.34-1.67c-.14-.24-.02-.37.1-.49l.36-.42c.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.31-.74-1.79-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.83-.84 2.02 0 1.19.86 2.34.98 2.5.12.16 1.69 2.59 4.09 3.63 1.52.66 2.12.72 2.88.6.44-.07 1.44-.59 1.64-1.15.2-.56.2-1.04.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}
export function FloatingActions({
  backToTop,
  whatsapp,
}: {
  backToTop: boolean;
  whatsapp: Settings["whatsapp"];
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let settling: "top" | "bottom" | undefined;
    const clear = () => {
      settling = undefined;
    };
    const wheel = (event: WheelEvent) => {
      if (
        motion.matches ||
        event.ctrlKey ||
        event.shiftKey ||
        !event.cancelable ||
        event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
        document.querySelector("dialog[open]")
      )
        return;
      const scroll = document.scrollingElement;
      if (!scroll) return;
      const bottom = scroll.scrollHeight - scroll.clientHeight;
      const edge = event.deltaY < 0 ? "top" : "bottom";
      const distance =
        edge === "top" ? scroll.scrollTop : bottom - scroll.scrollTop;
      if (settling && settling !== edge) {
        clear();
        window.scrollTo({ top: scroll.scrollTop, behavior: "instant" });
        return;
      }
      if (distance <= 1 || distance > Math.min(100, Math.abs(event.deltaY)))
        return;
      if (
        event
          .composedPath()
          .some(
            (node) =>
              node instanceof HTMLElement &&
              node !== scroll &&
              node.scrollHeight > node.clientHeight &&
              /^(auto|scroll)$/.test(getComputedStyle(node).overflowY),
          )
      )
        return;
      event.preventDefault();
      if (settling === edge) return;
      settling = edge;
      window.scrollTo({ top: edge === "top" ? 0 : bottom, behavior: "smooth" });
    };
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("scrollend", clear);
    window.addEventListener("pointerdown", clear);
    const update = () => setScrolled(window.scrollY > 220);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("scrollend", clear);
      window.removeEventListener("pointerdown", clear);
    };
  }, []);
  const active = whatsapp.enabled && Boolean(whatsapp.number);
  const fallback = !whatsapp.number;
  const base =
    "size-11 place-items-center rounded-full text-white shadow-lg motion-safe:transition-transform motion-safe:hover:-translate-y-0.5";
  const contactStyle =
    base +
    " bg-[#087f46] hover:bg-[#076b3c] " +
    (whatsapp.mobile ? "grid" : "hidden") +
    (whatsapp.desktop ? " md:grid" : " md:hidden") +
    (whatsapp.position === "left"
      ? " fixed left-4 bottom-[max(1rem,env(safe-area-inset-bottom))]"
      : "");
  const title = whatsapp.tooltip || "Chat on WhatsApp";
  return (
    <div
      aria-label="Page shortcuts"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex flex-col items-end gap-2"
    >
      {backToTop && scrolled && (
        <button
          type="button"
          className={base + " grid bg-navy hover:bg-brand"}
          title="Back to top"
          aria-label="Back to top"
          onClick={() => {
            const reduced = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;
            window.scrollTo({
              top: 0,
              behavior: reduced ? "instant" : "smooth",
            });
          }}
        >
          <ArrowUp size={19} aria-hidden />
        </button>
      )}
      {active ? (
        <a
          className={contactStyle}
          aria-label={title}
          title={title}
          href={
            "https://wa.me/" +
            whatsapp.number +
            "?text=" +
            encodeURIComponent(whatsapp.message)
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppMark />
        </a>
      ) : (
        fallback && (
          <SiteLink
            className={contactStyle}
            href={companyEnquiryUrl}
            title="Open company enquiry form"
            aria-label="Open company enquiry form"
          >
            <WhatsAppMark />
          </SiteLink>
        )
      )}
    </div>
  );
}
export function MobileNav({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <div className="lg:hidden">
      <button
        className="arrow"
        aria-label="Open navigation"
        onClick={() => ref.current?.showModal()}
      >
        <Menu size={22} />
      </button>
      <dialog
        ref={ref}
        className="ml-auto h-dvh max-h-dvh w-[min(86vw,380px)] max-w-none bg-white p-6 text-navy backdrop:bg-ink/60"
        aria-label="Navigation"
      >
        <button
          className="arrow mb-6 ml-auto"
          aria-label="Close navigation"
          onClick={() => ref.current?.close()}
        >
          <X size={22} />
        </button>
        <div
          onClickCapture={(e) => {
            if (
              (e.target as Element).closest("a,button:not([data-menu-toggle])")
            )
              ref.current?.close();
          }}
        >
          {children}
        </div>
      </dialog>
    </div>
  );
}
export function Carousel({
  children,
  count,
  hero = false,
  autoplay = false,
  delay = 7000,
  caption,
  initial = 0,
}: {
  children: ReactNode;
  count: number;
  hero?: boolean;
  autoplay?: boolean;
  delay?: number;
  caption?: string;
  initial?: number;
}) {
  const [viewport, api] = useEmblaCarousel({
    align: "start",
    startIndex: initial,
    loop: hero,
    containScroll: "trimSnaps",
  });
  const [active, setActive] = useState(initial);
  const [edges, setEdges] = useState([false, count > 1]);
  const [paused, pause] = useState(false);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (!api) return;
    const update = () => {
      setActive(api.selectedScrollSnap());
      setEdges([api.canScrollPrev(), api.canScrollNext()]);
    };
    const syncFocus = () => {
      const visible = hero ? [api.selectedScrollSnap()] : api.slidesInView();
      api.slideNodes().forEach((node, index) => {
        node.inert = !visible.includes(index);
      });
    };
    syncFocus();
    api
      .on("select", syncFocus)
      .on("slidesInView", syncFocus)
      .on("reInit", syncFocus);
    update();
    api.on("select", update).on("reInit", update).on("pointerDown", stop);
    function stop() {
      pause(true);
    }
    return () => {
      api
        .off("select", update)
        .off("reInit", update)
        .off("pointerDown", stop)
        .off("select", syncFocus)
        .off("slidesInView", syncFocus)
        .off("reInit", syncFocus);
    };
  }, [api, hero]);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!api || !autoplay || paused || hover || motion.matches || count < 2)
      return;
    const timer = window.setInterval(() => {
      if (!document.hidden && !motion.matches) api.scrollNext();
    }, delay);
    return () => clearInterval(timer);
  }, [api, autoplay, paused, hover, count, delay]);
  const navigate = (index: number) => {
    pause(true);
    const jump = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (index < 0) api?.scrollPrev(jump);
    else if (index >= count) api?.scrollNext(jump);
    else api?.scrollTo(index, jump);
  };
  const buttons = (
    <div className="flex gap-2">
      <button
        className="arrow disabled:opacity-40"
        aria-label="Previous slide"
        disabled={!edges[0]}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
      </button>
      <button
        className="arrow disabled:opacity-40"
        aria-label="Next slide"
        disabled={!edges[1]}
        onClick={() => navigate(count)}
      >
        <ArrowRight size={16} />
      </button>
    </div>
  );
  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => pause(true)}
    >
      <div ref={viewport} className="overflow-hidden">
        <div
          className={
            hero ? "flex touch-pan-y" : "flex touch-pan-y gap-4 lg:gap-5"
          }
          data-carousel-track={!api && hero ? "preinit" : undefined}
          style={
            hero
              ? ({ "--initial-slide": -initial * 100 + "%" } as CSSProperties)
              : undefined
          }
        >
          {children}
        </div>
      </div>
      {hero ? (
        count > 1 && (
          <div className="wrap pointer-events-none absolute inset-x-0 bottom-4 flex items-end justify-between text-white">
            <div className="pointer-events-auto flex items-center gap-1">
              {Array.from({ length: count }, (_, i) => (
                <button
                  key={i}
                  onClick={() => navigate(i)}
                  aria-label={"Go to slide " + (i + 1)}
                  aria-current={i === active}
                  className="flex h-6 items-center px-0.5"
                >
                  <span
                    className={
                      "block h-2 rounded-full " +
                      (i === active ? "w-7 bg-brand" : "w-2 bg-white/60")
                    }
                  />
                </button>
              ))}
            </div>
            <div className="pointer-events-auto">{buttons}</div>
          </div>
        )
      ) : (
        <div className="mt-6 flex min-h-10 items-center justify-between gap-3 text-sm">
          <span className="text-muted">{caption}</span>
          {count > 1 && buttons}
        </div>
      )}
      {hero && count > 1 && autoplay && (
        <button
          className="absolute right-4 top-4 rounded bg-ink/85 px-3 py-1 text-xs text-white"
          onClick={() => pause((v) => !v)}
        >
          {paused ? "Resume slides" : "Pause slides"}
        </button>
      )}
    </div>
  );
}
export function StatCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    const match = /^([+-]?)(\d+(?:,\d{2,3})*)(?:\.(\d{1,12}))?$/.exec(
      value.trim(),
    );
    if (!node || !match || !("IntersectionObserver" in window)) return;
    const target = Number(
      match[2].replaceAll(",", "") + (match[3] ? "." + match[3] : ""),
    );
    if (!target || target > Number.MAX_SAFE_INTEGER) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fraction = match[3]?.length || 0;
    const format = new Intl.NumberFormat(
      /,\d{2},/.test(match[2]) ? "en-IN" : "en-US",
      {
        useGrouping: match[2].includes(","),
        minimumFractionDigits: fraction,
        maximumFractionDigits: fraction,
      },
    );
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (motion.matches) return;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, Math.max(0, (now - start) / 1050));
          if (progress === 1 || motion.matches) {
            node.textContent = value;
            return;
          }
          node.textContent =
            match[1] + format.format(target * (1 - (1 - progress) ** 3));
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      node.textContent = value;
    };
  }, [value]);
  return (
    <>
      <span className="sr-only">{value}</span>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
    </>
  );
}

export function VideoPlayer({
  video,
  sample,
  title,
  children,
}: {
  video: string;
  sample?: string;
  title: string;
  children: ReactNode;
}) {
  const [play, setPlay] = useState(false);
  return (
    <div className="relative aspect-video bg-ink text-white">
      {play && sample ? (
        <video
          controls
          autoPlay
          playsInline
          aria-label={title}
          className="absolute size-full"
          src={sample}
        />
      ) : play ? (
        <iframe
          title={title}
          src={
            "https://www.youtube-nocookie.com/embed/" + video + "?autoplay=1"
          }
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute size-full"
        />
      ) : (
        <>
          {children}
          {(video || sample) && (
            <button
              type="button"
              className="absolute inset-0 grid place-items-center"
              aria-label={"Play " + title}
              onClick={() => setPlay(true)}
            >
              <span className="rounded-xl bg-brand p-3">
                <Play size={21} fill="currentColor" />
              </span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
export function Article({ title, body }: { title: string; body: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        className="inline-flex items-center gap-2 text-sm font-extrabold text-brand hover:underline"
        onClick={() => ref.current?.showModal()}
      >
        Read article <ArrowRight size={13} />
      </button>
      <dialog
        ref={ref}
        aria-label={title}
        className="panel m-auto max-h-[90dvh] w-[min(92vw,660px)] overflow-y-auto p-7 text-navy backdrop:bg-ink/70"
      >
        <button
          className="arrow mb-4 ml-auto"
          aria-label="Close article"
          onClick={() => ref.current?.close()}
        >
          <X size={19} />
        </button>
        <h2 className="title mb-5">{title}</h2>
        {body}
      </dialog>
    </>
  );
}
export function EnquiryForm({
  config: c,
  options,
  source = "contact",
  stretch = false,
  wideButton = false,
}: {
  config: FormCopy;
  options: Options;
  source?: Source;
  stretch?: boolean;
  wideButton?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<
    z.input<typeof enquirySchema>,
    unknown,
    z.output<typeof enquirySchema>
  >({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      loan: "",
      message: "",
      consent: false,
      website: "",
      source,
    },
  });
  const fields = [
    ["name", c.nameLabel, c.namePlaceholder, "text", "name"],
    ["phone", c.phoneLabelForm, c.phonePlaceholder, "tel", "tel"],
    ["email", c.emailLabelForm, c.emailPlaceholder, "email", "email"],
  ] as const;
  return (
    <div className={stretch ? "lg:flex lg:flex-1 lg:flex-col" : undefined}>
      <h2 className="mb-2 text-lg font-extrabold">{c.formTitle}</h2>
      <p className="mb-5 text-sm text-muted">{c.formCopy}</p>
      <form
        noValidate
        onSubmit={handleSubmit(async (values) => {
          try {
            const r = await fetch("/api/enquiries", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            });
            const result = await r.json();
            if (!r.ok) {
              setError("root", { message: result.message });
              return;
            }
            toast.success(
              r.status === 201
                ? c.success || result.message
                : result.message || c.success,
            );
            reset();
          } catch {
            setError("root", {
              message: "Connection failed. Please try again.",
            });
          }
        })}
        className={
          "grid gap-3 sm:grid-cols-2" +
          (stretch
            ? " lg:flex-1 lg:grid-rows-[auto_auto_minmax(6rem,1fr)]"
            : "")
        }
      >
        {fields.map(([key, label, placeholder, type, autoComplete]) => (
          <label key={key} className="space-y-1 text-xs font-extrabold">
            {label}
            {key !== "email" && " *"}
            <input
              className="field font-normal"
              type={type}
              autoComplete={autoComplete}
              placeholder={placeholder}
              aria-required={key !== "email"}
              aria-invalid={!!errors[key]}
              {...register(key)}
            />
            {errors[key] && (
              <span role="alert" className="block text-brand">
                {errors[key]?.message}
              </span>
            )}
          </label>
        ))}
        <label className="space-y-1 text-xs font-extrabold">
          {c.loanLabel} *
          <select
            className="field font-normal"
            aria-required
            aria-invalid={!!errors.loan}
            {...register("loan")}
          >
            <option value="">{c.loanPlaceholder}</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.loan && (
            <span role="alert" className="block text-brand">
              {errors.loan.message}
            </span>
          )}
        </label>
        <label
          className={
            "space-y-1 text-xs font-extrabold sm:col-span-2" +
            (stretch ? " lg:flex lg:flex-col" : "")
          }
        >
          {c.messageLabel}
          <textarea
            className={
              "field min-h-24 font-normal" + (stretch ? " lg:flex-1" : "")
            }
            placeholder={c.messagePlaceholder}
            maxLength={1500}
            {...register("message")}
          />
        </label>
        <label className="absolute left-[-10000px]" aria-hidden="true">
          Website
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-2 text-xs text-muted">
            <input
              className="mt-0.5 accent-navy"
              type="checkbox"
              aria-required
              {...register("consent")}
            />
            {c.consent}
          </label>
          {errors.consent && (
            <p role="alert" className="text-xs text-brand">
              {errors.consent.message}
            </p>
          )}
        </div>
        {errors.root && (
          <p role="alert" className="text-sm text-brand sm:col-span-2">
            {errors.root.message}
          </p>
        )}
        <div className="sm:col-span-2">
          <button
            className={
              "button disabled:opacity-60" + (wideButton ? " w-full" : "")
            }
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending…" : c.button}
            <ArrowUpRight size={14} />
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-muted sm:col-span-2">
          {c.disclaimer}
        </p>
      </form>
    </div>
  );
}
