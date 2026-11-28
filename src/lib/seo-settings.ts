import { globals } from "./content";
import { z } from "zod";

export const seoSettings = globals.pick({
  websiteName: true,
  defaultTitle: true,
  titleTemplate: true,
  defaultDescription: true,
  baseUrl: true,
  defaultImage: true,
  favicon: true,
  organization: true,
  logo: true,
  profiles: true,
  googleVerification: true,
  bingVerification: true,
  index: true,
  follow: true,
});

export type SeoSettings = z.infer<typeof seoSettings>;
