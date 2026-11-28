import { businessDetails } from "./contact-details";
import type { Metadata } from "next";
import type { Seo, Site, Settings } from "./content";
export function baseUrl(site?: Pick<Site, "settings"> | null) {
  for (const candidate of [
    site?.settings.baseUrl,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.AUTH_URL,
  ]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) return url.origin;
    } catch {}
  }
  return "";
}
export function canonicalUrl(value: string, path: string, base: string) {
  for (const candidate of [value, path]) {
    if (!candidate || /[\s\\#]/.test(candidate)) continue;
    const local = /^\/(?!\/)/.test(candidate);
    try {
      const url = local ? base && new URL(candidate, base) : new URL(candidate);
      if (!url && local) return candidate;
      if (url && ["http:", "https:"].includes(url.protocol) && !url.username && !url.password)
        return url.href;
    } catch {}
  }
  return path;
}

export function searchAppearance(
  settings: Pick<Settings, "defaultTitle" | "defaultDescription" | "titleTemplate" | "defaultImage">,
  seo: Seo,
  path: string,
  base: string,
  pageTitle = "",
) {
  const label = seo.title || pageTitle || settings.defaultTitle;
  return {
    label,
    title: (seo.title || pageTitle) && settings.titleTemplate.includes("%s")
      ? settings.titleTemplate.replace("%s", () => label)
      : label,
    description: seo.description || settings.defaultDescription,
    canonical: canonicalUrl(seo.canonical, path, base),
    image: seo.ogImage || settings.defaultImage,
  };
}

type MetadataSite = Site & { bundled?: boolean };

export function pageMetadata(site: MetadataSite, p: Seo, path: string, pageTitle = ""): Metadata {
  const s = site.settings;
  const base = baseUrl(site);
  const { title, label, description, canonical, image } = searchAppearance(s, p, path, base, pageTitle);
  const twitterImage = p.twitterImage || image;
  const noIndex = site.bundled || process.env.VERCEL_ENV === "preview" || !process.env.MONGODB_URI;
  return {
    metadataBase: base ? new URL(base) : undefined,
    title: { absolute: title },
    description,
    alternates: { canonical: /^https?:/.test(canonical) ? canonical : undefined },
    robots: { index: !noIndex && s.index && p.index, follow: !noIndex && s.follow && p.follow },
    icons: s.favicon ? [s.favicon] : undefined,
    verification: {
      google: s.googleVerification || undefined,
      other: s.bingVerification
        ? { "msvalidate.01": s.bingVerification }
        : undefined,
    },
    openGraph: {
      type: "website",
      siteName: s.websiteName,
      title: p.ogTitle || label,
      description: p.ogDescription || description,
      url: /^https?:/.test(canonical) ? canonical : undefined,
      images: image && (base || image.startsWith("https://"))
        ? [{ url: image, alt: p.ogImageAlt || undefined }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: p.twitterTitle || label,
      description: p.twitterDescription || description,
      images: twitterImage && (base || twitterImage.startsWith("https://"))
        ? [{ url: twitterImage, alt: p.twitterImageAlt || (!p.twitterImage ? p.ogImageAlt : undefined) }]
        : undefined,
    },
  };
}
export function homeMetadata(site: MetadataSite): Metadata {
  return pageMetadata(site, site.page.seo, "/");
}
export function structured(site: Site) {
  const details = businessDetails(site);
  const s = site.settings,
    base = baseUrl(site);
  const questions = site.sections.some(
    (section) => section.type === "faqs" && section.visible,
  )
    ? site.records.faqs.filter(
        (item) => item.visible && item.question && item.answer,
      )
    : [];
  if (!base) return null;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type":
          details.phone && details.address
            ? ["Organization", "FinancialService"]
            : "Organization",
        "@id": base + "/#organization",
        name: s.organization,
        url: base,
        logo: s.logo ? new URL(s.logo, base).href : undefined,
        telephone: details.phone || undefined,
        email: details.email || undefined,
        address: details.address || undefined,
        sameAs: s.profiles.filter((v) => v.startsWith("https://")),
      },
      {
        "@type": "WebSite",
        "@id": base + "/#website",
        url: base,
        name: s.websiteName,
        publisher: { "@id": base + "/#organization" },
      },
      {
        "@type": "WebPage",
        "@id": base + "/#home",
        url: base + "/",
        name: site.page.seo.title || s.defaultTitle,
        description: site.page.seo.description || s.defaultDescription,
        isPartOf: { "@id": base + "/#website" },
      },
      ...(questions.length
        ? [
            {
              "@type": "FAQPage",
              "@id": base + "/#faqs",
              isPartOf: { "@id": base + "/#home" },
              mainEntity: questions.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            },
          ]
        : []),
    ],
  };
}
