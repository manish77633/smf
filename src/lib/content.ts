import { z } from "zod";
const text = z.string().max(240);
const copy = z.string().max(4000);
const rich = z.string().max(30000);
const flag = z.boolean();
const link = z
  .string()
  .max(600)
  .refine(
    (v) =>
      !v ||
      /^[#][a-z0-9-]+$/i.test(v) ||
      /^(https:\/\/[^\s]+|mailto:[^\s]+|tel:\+?[0-9]+|\/(?!\/)[a-z0-9/_-]*(?:#[a-z0-9-]+)?)$/i.test(
        v,
      ),
    "Use an HTTPS URL, local path or section anchor",
  );
const image = z
  .string()
  .max(600)
  .refine(
    (v) =>
      !v ||
      /^\/images\/[\w.-]+$/.test(v) ||
      /^\/media\/[a-f0-9-]{36}$/.test(v) ||
      /^https:\/\/res\.cloudinary\.com\/[\w/.,%~-]+$/.test(v),
    "Select an image from the media library",
  );
export const media = z.object({ image, alt: text });
export const action = z.object({ label: text, url: link, enquiry: flag });
export const heading = z.object({
  eyebrow: text,
  heading: text,
  highlight: text,
  description: copy,
});
export const ordered = z.object({
  visible: flag,
  order: z.number().int().min(0).max(10000),
});
const tile = ordered.extend({ label: text, icon: text });
export const detailField = tile.extend({ description: copy, cta: action.optional() });
const navItem = ordered.extend(action.shape);
const contact = z.object({
  email: z.union([z.literal(""), z.email()]),
  phone: text,
  address: text,
});
export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(100);
export const list = <T extends z.ZodType>(schema: T) => z.array(schema).max(40);
export const statuses = [
  "New",
  "Contacted",
  "In Progress",
  "Converted",
  "Closed",
  "Spam",
] as const;
export const seo = z.object({
  title: text,
  description: copy,
  canonical: link,
  ogTitle: text,
  ogDescription: copy,
  ogImage: image,
  ogImageAlt: text.optional(),
  twitterTitle: text,
  twitterDescription: copy,
  twitterImage: image,
  twitterImageAlt: text.optional(),
  index: flag,
  follow: flag,
  sitemap: flag,
});
export type Seo = z.infer<typeof seo>;
export const entities = {
  loans: ordered.extend({
    title: text,
    slug,
    photo: media.optional(),
    icon: text,
    red: flag,
    description: copy,
    cta: action,
    featured: flag,
  }),
  videos: ordered.extend({
    title: text,
    youtube: text,
    thumbnail: media,
    description: copy,
  }),
  testimonials: ordered.extend({
    slug,
    name: text,
    avatar: media,
    review: copy,
    rating: z.number().int().min(1).max(5),
    designation: text,
    consent: flag,
    example: flag.optional(),
  }),
  blogs: ordered.extend({
    title: text,
    slug,
    photo: media,
    excerpt: copy,
    body: rich,
    category: text,
    author: text,
    minutes: z.number().int().min(1).max(120),
    date: text,
    featured: flag,
    seo,
  }),
  faqs: ordered.extend({ question: text, answer: copy }),
};
export const sections = {
  custom: heading.extend({
    photo: media,
    icon: text,
    body: rich,
    cta: action,
    fields: list(detailField),
  }),
  bar: z.object({ left: text, right: text, icon: text, cta: action }),
  header: z.object({
    logo: media,
    items: list(navItem),
    outline: action,
    primary: action,
    loanMenu: flag.optional(),
    loanMenuUrl: link.optional(),
  }),
  hero: z.object({
    autoplay: flag,
    initialSlide: z.number().int().min(1).max(40),
    delay: z.number().int().min(3500).max(30000),
    slides: list(
      ordered.extend({
        intro: heading,
        photo: media,
        opacity: z.number().min(0).max(1),
        cta: action,
        trust: list(tile),
        advisor: heading.optional(),
        advisorCta: action,
        disclaimer: copy.optional(),
      }),
    ),
  }),
  trust: z.object({
    caption: text,
    items: list(tile),
    homeHighlights: z.object({
      supportHeading: text,
      hideSupport: flag.optional(),
      cards: list(ordered.extend({ title: text, description: copy, icon: text, photo: media, cta: action })),
      productsHeading: text,
      hideProducts: flag.optional(),
      products: list(ordered.extend({ slug })),
      emiTitle: text,
      hideEmi: flag.optional(),
      emiIcon: text.optional(),
      emiDescription: copy,
      emiLabel: text,
      emiLink: link,
      emiPhoto: media,
      reasonsHeading: text,
      hideReasons: flag.optional(),
      reasons: list(tile.extend({ description: copy })),
    }).optional(),
  }),
  loans: heading,
  about: heading.extend({
    photo: media,
    badge: text,
    badgeAccent: text,
    badgeCopy: copy,
    body: rich,
    features: list(tile),
    cta: action,
  }),
  statistics: heading.extend({
    items: list(
      ordered.extend({
        value: text,
        prefix: text,
        suffix: text,
        label: text,
        verified: flag,
      }),
    ),
  }),
  videos: heading,
  testimonials: heading.extend({ caption: text }),
  blogs: heading.extend({ caption: text }),
  faqs: heading.extend({ supportTitle: text, supportCopy: copy, cta: action }),
  contact: heading.extend({
    details: contact.extend({
      hours: text.optional(),
      directions: z
        .string()
        .trim()
        .max(600)
        .refine(
          (value) =>
            !/^(?:[a-z][a-z0-9+.-]*:|[/\\])/i.test(value) ||
            (/^(?:https:\/\/|\/(?![\/\\]))/i.test(value) &&
              link.safeParse(value).success),
          "Paste an office address or an HTTPS maps link",
        )
        .optional(),
    }),
    hoursLabel: text.optional(),
    emailLabel: text,
    phoneLabel: text,
    addressLabel: text,
    formTitle: text,
    formCopy: copy,
    nameLabel: text,
    namePlaceholder: text,
    phoneLabelForm: text,
    phonePlaceholder: text,
    emailLabelForm: text,
    emailPlaceholder: text,
    loanLabel: text,
    loanPlaceholder: text,
    messageLabel: text,
    messagePlaceholder: text,
    consent: text,
    disclaimer: copy,
    button: text,
    success: text,
    recipient: z.union([z.literal(""), z.email()]),
    options: list(z.object({ value: text, label: text })),
  }),
  banner: z.object({ heading: text, description: copy, cta: action }),
  footer: z.object({
    useHeaderLogo: flag.optional(),
    logo: media,
    description: copy,
    columns: list(
      z.object({
        title: text,
        description: copy.optional(),
        links: list(navItem),
      }),
    ),
    contactTitle: text,
    details: contact,
    socials: list(navItem.extend({ icon: text.optional() })),
    contactFields: list(
      ordered.extend({ label: text, value: copy, icon: text, url: link }),
    ).optional(),
    note: copy.optional(),
    backToTop: flag.optional(),
    legal: list(navItem),
    copyright: text,
  }),
};
export type SectionKey = keyof typeof sections;
export type EntityKey = keyof typeof entities;
export type Content<K extends SectionKey> = z.infer<(typeof sections)[K]>;
export type Item<K extends EntityKey> = z.infer<(typeof entities)[K]>;
export type Action = z.infer<typeof action>;
export type Heading = z.infer<typeof heading>;
export type Photo = z.infer<typeof media>;
export type Section = {
  [K in SectionKey]: {
    id: K extends "custom" ? `custom-${string}` : K;
    type: K;
    label: string;
    visible: boolean;
    content: Content<K>;
  };
}[SectionKey];
export type Records = { [K in EntityKey]: Item<K>[] };
export const globals = z.object({
  websiteName: text,
  defaultTitle: text,
  titleTemplate: text,
  defaultDescription: copy,
  baseUrl: link,
  defaultImage: image,
  favicon: image,
  organization: text,
  logo: image,
  details: contact,
  profiles: list(link),
  googleVerification: text,
  bingVerification: text,
  index: flag,
  follow: flag,
  whatsapp: z.object({
    enabled: flag,
    number: z.string().regex(/^(?:[1-9][0-9]{7,14})?$/),
    message: copy,
    tooltip: text,
    position: z.enum(["left", "right"]),
    desktop: flag,
    mobile: flag,
  }),
  redirects: list(
    z.object({
      from: z.string().regex(/^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/),
      to: link,
      permanent: flag,
    }),
  ),
});
export const pageFields = z.object({
  title: text,
  slug: z.literal("home"),
  status: z.enum(["draft", "published"]),
  seo,
});
export type PageFields = z.infer<typeof pageFields>;
export type Settings = z.infer<typeof globals>;
export type Draft = {
  page: PageFields;
  sections: Section[];
  settings: Settings;
};
export type Site = Draft & { records: Records };
export const sortVisible = <T extends { visible: boolean; order: number }>(
  items: T[],
) => items.filter((i) => i.visible).sort((a, b) => a.order - b.order);
export function sampleVideo(url: string) {
  return /^\/videos\/(loan-options|documents|monthly-budget)\.mp4$/.test(url);
}
export function youtubeId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    if (parsed.protocol !== "https:") return "";
    const id =
      host === "youtu.be"
        ? parsed.pathname.slice(1)
        : ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)
          ? parsed.searchParams.get("v") ||
            parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1]
          : "";
    return /^[\w-]{11}$/.test(id || "") ? id! : "";
  } catch {
    return "";
  }
}
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s()-]/g, "").replace(/^\+91(?=\d{10}$)/, ""))
    .pipe(
      z.string().regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.union([z.literal(""), z.email()])),
  loan: z.string().min(1, "Select a loan").max(120),
  message: z.string().trim().max(1500),
  consent: z.boolean().refine(Boolean, "Please confirm your consent"),
  website: z.string().max(200),
  source: z.enum([
    "contact",
    "header",
    "hero",
    "advisor",
    "services",
    "contact-page",
    "loan",
    "faq",
    "banner",
    "footer",
    "about",
    "bar",
  ]),
});
