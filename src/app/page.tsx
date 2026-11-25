import { notFound } from "next/navigation";
import { Home } from "@/components/home";
import { getSite } from "@/lib/site";
import { homeMetadata, structured } from "@/lib/metadata";
export const revalidate = 300;
export async function generateMetadata() {
  const site = await getSite();
  return site?.page.status === "published" && process.env.MONGODB_URI
    ? homeMetadata(site)
    : {
        title: site?.settings.defaultTitle,
        icons: ["/images/smf.svg"],
        robots: { index: false, follow: false },
      };
}
export default async function Page() {
  const site = await getSite();
  if (!site || site.page.status !== "published") notFound();
  const json = structured(site);
  return (
    <>
      {json && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(json).replaceAll("<", "\\u003c"),
          }}
        />
      )}
      <Home
        site={site}
        preview={
          process.env.NODE_ENV === "development" && !process.env.MONGODB_URI
        }
      />
    </>
  );
}
