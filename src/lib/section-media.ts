import { bundledMedia } from "./bundled-media";
import type { Photo } from "./content";

const loanImages: Record<string, string> = {
  "gold-loan": "gold-loan.jpg",
  "business-loan": "reference-shop.webp",
  "construction-loan": "construction-loan.jpg",
  "loan-against-property": "home.jpg",
  "group-loan": "reference-sewing.webp",
  "personal-loan": "reference-family.webp",
};
const pageHeroImages: Record<string, string> = {
  ...loanImages,
  contact: "team.jpg",
  services: "reference-hero.webp",
  "home-loan": "home.jpg",
};

function defaultPhoto(file: string | undefined): Photo {
  const url = file ? "/images/" + file : "";
  return { image: url, alt: bundledMedia.find((asset) => asset.url === url)?.alt ?? "" };
}

export function pageHeroPhoto(slug: string, photo: Photo): Photo {
  if (photo.image) return photo;
  const fallback = defaultPhoto(Object.hasOwn(pageHeroImages, slug) ? pageHeroImages[slug] : undefined);
  return { ...fallback, alt: photo.alt || fallback.alt };
}

export function homeHeroPhoto(photo: Photo): Photo {
  return photo.image === "/images/hero.jpg" ? defaultPhoto("reference-hero.webp") : photo;
}

export function mobileHeroPhoto(photo: Photo, mobile?: Photo): Photo | undefined {
  if (mobile?.image) return mobile;
  if (photo.image === "/images/reference-hero.webp") return defaultPhoto("reference-hero-mobile.webp");
}

export function serviceCardPhoto(slug: string, photo?: Photo): Photo {
  return photo?.image ? photo : defaultPhoto(Object.hasOwn(loanImages, slug) ? loanImages[slug] : undefined);
}
