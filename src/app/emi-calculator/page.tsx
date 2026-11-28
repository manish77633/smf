import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";
import EmiCalculator from "@/components/emi-calculator";
import { block, type EditablePage } from "@/lib/pages";
import { publicLanguage, localize } from "@/lib/public-language";
import { emptySeo } from "@/lib/seed-content";
import { getSite } from "@/lib/site";

export const metadata: Metadata = { title: "EMI Calculator" };

const page: EditablePage = {
  slug: "emi-calculator",
  title: "EMI Calculator",
  seo: emptySeo,
  sections: [
    block("hero", 901, "EMI Calculator", {
      intro: {
        eyebrow: "",
        heading: "EMI Calculator",
        highlight: "",
        description: "Estimate your monthly payment using the loan amount, interest rate and repayment term.",
      },
      photo: { image: "/images/reference-emi.webp", alt: "Calculator and pen" },
      cta: { label: "Calculate EMI", url: "#calculator", enquiry: false },
    }),
  ],
};

export default async function CalculatorPage() {
  const site = await getSite();
  const calculator = <div id="calculator" className="scroll-mt-24"><EmiCalculator /></div>;
  if (!site) return <main><h1 className="wrap title pt-8">{page.title}</h1>{calculator}</main>;
  const language = await publicLanguage();
  return (
    <ContentPage page={localize(page, language)} site={localize(site, language)}>
      {calculator}
    </ContentPage>
  );
}
