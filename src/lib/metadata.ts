import type { Metadata } from "next";
import type { Site } from "./content";
export function baseUrl(site?: Site | null) {
  for (const candidate of [
    site?.settings.baseUrl,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.AUTH_URL,
  ]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (["http:", "https:"].includes(url.protocol)) return url.origin;
    } catch {}
  }
  return "";
}
export function homeMetadata(site: Site): Metadata {
  const s = site.settings,
    p = site.page.seo,
    base = baseUrl(site),
    title = p.title || s.defaultTitle,
    description = p.description || s.defaultDescription;
  const canonical = p.canonical || "/";
  return {
    metadataBase: base ? new URL(base) : undefined,
    title: {
      absolute:
        p.title && s.titleTemplate.includes("%s")
          ? s.titleTemplate.replace("%s", title)
          : title,
    },
    description,
    alternates: { canonical: base ? new URL(canonical, base) : undefined },
    robots: { index: s.index && p.index, follow: s.follow && p.follow },
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
      title: p.ogTitle || title,
      description: p.ogDescription || description,
      url: base || undefined,
      images:
        (p.ogImage || s.defaultImage) && base
          ? [p.ogImage || s.defaultImage]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: p.twitterTitle || title,
      description: p.twitterDescription || description,
      images:
        (p.twitterImage || p.ogImage || s.defaultImage) && base
          ? [p.twitterImage || p.ogImage || s.defaultImage]
          : undefined,
    },
  };
}
export function structured(site: Site) {
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
          s.details.phone && s.details.address
            ? ["Organization", "FinancialService"]
            : "Organization",
        "@id": base + "/#organization",
        name: s.organization,
        url: base,
        logo: s.logo ? new URL(s.logo, base).href : undefined,
        telephone: s.details.phone || undefined,
        email: s.details.email || undefined,
        address: s.details.address || undefined,
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
