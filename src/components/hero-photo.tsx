import { getImageProps } from "next/image";
import type { CSSProperties } from "react";
import type { Photo } from "@/lib/content";
import { mobileHeroPhoto } from "@/lib/section-media";

const mobileFocus: Record<string, string> = {
  "/images/reference-shop.webp": "55% top",
  "/images/construction-loan.jpg": "32% top",
};

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
    sizes: "(max-width: 767px) max(100vw, 150svh), 64vw",
    loading: priority ? "eager" : "lazy",
    fetchPriority: priority ? "high" : "auto",
  });
  const source = portrait?.image && getImageProps({
    src: portrait.image, alt: portrait.alt, fill: true, sizes: "100vw",
  }).props;
  const focus = mobileFocus[(portrait || base).image];
  return (
    <picture
      className={`public-hero-photo ${className}`}
      style={focus ? { "--hero-mobile-focus": focus } as CSSProperties : undefined}
    >
      {source && <source media="(max-width: 767px)" srcSet={source.srcSet} sizes={source.sizes} />}
      <img {...props} alt={alt} />
    </picture>
  );
}
