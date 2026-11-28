import { getImageProps } from "next/image";
import type { CSSProperties } from "react";
import type { Photo } from "@/lib/content";
import { mobileHeroPhoto } from "@/lib/section-media";

export default function HeroPhoto({ photo, mobile, priority, className }: {
  photo: Photo;
  mobile?: Photo;
  priority: boolean;
  className: string;
}) {
  const portrait = mobileHeroPhoto(photo, mobile);
  const base = photo.image ? photo : portrait;
  if (!base?.image) return null;
  const alt = base.alt || portrait?.alt || "";
  const { props } = getImageProps({
    src: base.image, alt, fill: true,
    sizes: "(max-width: 767px) 100vw, 64vw",
    loading: priority ? "eager" : "lazy",
    fetchPriority: priority ? "high" : "auto",
  });
  const source = portrait?.image && getImageProps({
    src: portrait.image, alt: portrait.alt, fill: true, sizes: "100vw",
  }).props;
  return (
    <picture
      className={`public-hero-photo ${className}`}
      data-portrait={Boolean(source)}
      style={!source ? { "--hero-backdrop": `url(${JSON.stringify(base.image)})` } as CSSProperties : undefined}
    >
      {source && <source media="(max-width: 767px)" srcSet={source.srcSet} sizes={source.sizes} />}
      <img {...props} alt={alt} />
    </picture>
  );
}
