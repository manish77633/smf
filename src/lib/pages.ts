import { loanPageContent } from "./loan-page-content";
import { z } from "zod";
import type { Item } from "./content";
import {
  action,
  heading,
  media,
  list,
  seo,
  slug,
  ordered,
  sections,
  detailField,
} from "./content";
import { draft, emptySeo } from "./seed-content";
const card = ordered.extend({
  title: z.string().max(240),
  description: z.string().max(4000),
  icon: z.string().max(80),
  cta: action.optional(),
});
export const formFields = sections.contact.pick({
  formTitle: true,
  formCopy: true,
  nameLabel: true,
  namePlaceholder: true,
  phoneLabelForm: true,
  phonePlaceholder: true,
  emailLabelForm: true,
  emailPlaceholder: true,
  loanLabel: true,
  loanPlaceholder: true,
  messageLabel: true,
  messagePlaceholder: true,
  consent: true,
  disclaimer: true,
  button: true,
  success: true,
});
const mapsEmbed = z
  .string()
  .max(3000)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return (
        url.origin === "https://www.google.com" &&
        url.pathname === "/maps/embed"
      );
    } catch {
      return false;
    }
  }, "Use a Google Maps embed URL from Share → Embed a map.");
const contactCard = card.extend({ cta: action });
const defaultContact = draft.sections.find(
  (s) => s.type === "contact",
)!.content;
const defaultForm = formFields.parse(defaultContact);
export const pageBlock = z.object({
  id: z.uuid(),
  visible: z.boolean(),
  label: z.string().min(1).max(100),
  type: z.enum([
    "hero",
    "breadcrumb",
    "services",
    "guidance",
    "steps",
    "questions",
    "richText",
    "contactForm",
    "officeMap",
    "overview",
    "highlights",
    "checklist",
    "notice",
    "custom",
  ]),
  intro: heading,
  cta: action,
  note: z.string().max(4000),
  items: list(card),
  icon: z.string().max(80),
  cardTitle: z.string().max(240),
  cardCopy: z.string().max(4000),
  photo: media,
  body: z.string().max(30000),
  form: formFields.optional(),
  contactCards: list(contactCard).optional(),
  mapUrl: mapsEmbed.optional(),
  dark: z.boolean().optional(),
  listedLoansOnly: z.boolean().optional(),
  fallbackTitle: z.string().max(240).optional(),
  fields: list(detailField).optional(),
});
export const editablePage = z.object({
  title: z.string().min(1).max(140),
  slug: slug.regex(/^(?!(?:home|admin|api|images|new)$)/),
  headerOutline: action.optional(),
  sections: list(pageBlock).refine(
    (items) => new Set(items.map((item) => item.id)).size === items.length,
  ),
  seo,
});
export type EditablePage = z.infer<typeof editablePage>;
export type PageBlock = z.infer<typeof pageBlock>;
export const emptyBlock = (
  type: PageBlock["type"],
  id: string,
  label: string = type,
): PageBlock => ({
  id,
  type,
  label,
  visible: true,
  intro: { eyebrow: "", heading: "", highlight: "", description: "" },
  cta: { label: "", url: "", enquiry: false },
  note: "",
  items: [],
  icon: "",
  cardTitle: "",
  cardCopy: "",
  photo: { image: "", alt: "" },
  body: "",
  ...(type === "contactForm" ? { form: defaultForm, contactCards: [] } : {}),
  ...(type === "officeMap" ? { mapUrl: "" } : {}),
});
export const block = (
  type: PageBlock["type"],
  n: number,
  label: string,
  overrides: Partial<PageBlock> = {},
) => ({
  ...emptyBlock(
    type,
    "00000000-0000-4000-8000-" + String(n).padStart(12, "0"),
    label,
  ),
  ...overrides,
});
export const intro = (
  eyebrow: string,
  heading: string,
  highlight: string,
  description: string,
) => ({ eyebrow, heading, highlight, description });
export const ask = (label: string, loan = "") => ({
  label,
  url: loan ? "#" + loan : "",
  enquiry: true,
});
export const cards = (rows: string[][]) =>
  rows.map(([title, description, icon = "Check"], order) => ({
    title,
    description,
    icon,
    order,
    visible: true,
  }));
export const servicesPage: EditablePage = {
  slug: "services",
  title: "Our Loan Services",
  seo: {
    ...emptySeo,
    title: "Our Loan Services",
    description:
      "Explore loan categories from Shree Mahavir Fincorp and speak with our team about your requirements.",
  },
  sections: [
    block("hero", 1, "Services hero", {
      intro: intro(
        "Explore our solutions",
        "Find a loan option for the",
        "next step.",
        "Every financial goal is different. Explore the loan categories showcased by Shree Mahavir Fincorp and speak with our team to understand which option may suit your requirement.",
      ),
      cta: ask("Talk to Our Team"),
      icon: "ArrowUpRight",
      cardTitle: "Start with what you need.",
      cardCopy:
        "Tell us about your plans. Our team can help explain the relevant enquiry process, information requirements and next steps.",
    }),
    block("breadcrumb", 2, "Breadcrumb", {
      cardTitle: "Home",
      cardCopy: "Our Loan Services",
    }),
    block("services", 3, "Loan categories", {
      intro: intro(
        "Our loan categories",
        "Explore the possibilities,",
        "one goal at a time.",
        "Take a closer look at the six loan categories featured on our website. Select a service to learn more or contact us to discuss your requirement.",
      ),
      note: "Loan availability, eligibility, documentation, fees and terms are subject to the company’s applicable policies and assessment.",
      items: cards([
        [
          "gold-loan",
          "Explore financing against eligible gold assets when you need funds for a personal, family or planned financial requirement.",
        ],
        [
          "business-loan",
          "Consider a business financing option to help address working-capital needs, operational expenses or a planned business opportunity.",
        ],
        [
          "construction-loan",
          "Explore funding options for a construction project, property improvement or another building-related requirement.",
        ],
        [
          "loan-against-property",
          "Understand the possibility of borrowing against eligible property to meet a qualifying personal or business requirement.",
        ],
        [
          "group-loan",
          "Learn about group-based financing options designed around shared requirements and the needs of participating members.",
        ],
        [
          "personal-loan",
          "Explore a personal financing option for life’s important expenses and milestones, subject to eligibility and assessment.",
        ],
      ]),
    }),
    block("guidance", 4, "Loan guidance", {
      intro: intro(
        "A clearer way forward",
        "Understand your options before you take the next step.",
        "",
        "Choosing a loan is an important decision. We encourage you to discuss your requirement with the team and review the relevant terms before proceeding.",
      ),
      cta: ask("Discuss Your Requirement"),
      items: cards([
        [
          "Share your requirement",
          "Tell us what you are planning and what kind of support you are exploring.",
        ],
        [
          "Understand the option",
          "Get information about the relevant loan category and its process.",
        ],
        [
          "Review the requirements",
          "Ask about documents, eligibility, fees and applicable terms.",
        ],
        [
          "Decide your next step",
          "Proceed only after reviewing the information and understanding the conditions.",
        ],
      ]),
    }),
    block("steps", 5, "Getting started", {
      intro: intro(
        "Getting started",
        "A simple way to begin a",
        "conversation.",
        "Our team can help you understand the enquiry process. The exact steps may vary by loan category and individual assessment.",
      ),
      items: cards([
        [
          "Choose a loan category",
          "Browse the options above and identify the category closest to your requirement.",
        ],
        [
          "Get in touch",
          "Send an enquiry or speak with the team to explain what you are looking for.",
        ],
        [
          "Discuss the details",
          "Understand the applicable eligibility, documentation, charges, terms and next steps.",
        ],
      ]),
    }),
    block("questions", 6, "Services FAQs", {
      intro: intro(
        "Helpful information",
        "Have questions about our loan services?",
        "",
        "Here are a few starting points. For product-specific information, please contact Shree Mahavir Fincorp directly.",
      ),
      cta: ask("Contact Our Team"),
      cardTitle: "Need help choosing?",
      cardCopy:
        "Tell us what you need finance for and our team can help you identify which category to enquire about.",
      items: cards([
        [
          "What types of loans are featured on this website?",
          "The website currently showcases Gold Loan, Business Loan, Construction Loan, Loan Against Property, Group Loan and Personal Loan. Please confirm current availability directly with the company.",
        ],
        [
          "How do I know which loan is right for me?",
          "Share your financing goal with our team so we can explain which options may suit your requirements.",
        ],
        [
          "What documents will I need?",
          "Documents depend on the loan category and your circumstances. Our team can explain the requirements for your enquiry.",
        ],
        [
          "Are loan eligibility and terms the same for everyone?",
          "Eligibility, charges and terms depend on the loan category and the applicable assessment.",
        ],
        [
          "How can I enquire about a specific loan?",
          "Choose the loan category above or contact our team and select the loan you are interested in.",
        ],
      ]),
    }),
  ],
};

export const contactPage: EditablePage = {
  slug: "contact",
  title: "Contact Us",
  seo: {
    ...emptySeo,
    title: "Contact Us",
    description:
      "Get in touch with Shree Mahavir Fincorp about your loan enquiry.",
  },
  sections: [
    block("hero", 101, "Contact hero", {
      intro: intro(
        "We’re here to help",
        "Let’s talk about what’s",
        "next.",
        "Have a question or want to understand your loan options? Send us an enquiry and the Shree Mahavir Fincorp team can help you understand the next step.",
      ),
      icon: "Mail",
      cardTitle: "Start a conversation.",
      cardCopy:
        "Share a few details about your requirement. Please keep bank details, identity numbers and other sensitive information out of this general enquiry form.",
    }),
    block("breadcrumb", 102, "Breadcrumb", {
      cardTitle: "Home",
      cardCopy: "Contact Us",
    }),
    block("contactForm", 103, "Contact details and enquiry form", {
      intro: intro(
        "Get in touch",
        "We’d be glad to",
        "hear from you.",
        "Whether you’re exploring a loan category, have a question about the enquiry process or simply need more information, reach out to our team.",
      ),
      cardTitle: "Send an enquiry",
      note: "",
      contactCards: cards([
        ["Call us", "Phone number to be confirmed", "Phone"],
        ["Email us", "Email address to be confirmed", "Mail"],
        ["Visit our office", "Office address to be confirmed", "MapPin"],
        ["Office hours", "Opening hours to be confirmed", "Clock"],
      ]).map((item) => ({
        ...item,
        cta: { label: "", url: "", enquiry: false },
      })),
      form: {
        ...defaultForm,
        formTitle: "How can we help you?",
        formCopy:
          "Complete the form below and let us know what you’d like to discuss.",
        nameLabel: "Full name",
        namePlaceholder: "Enter your full name",
        phoneLabelForm: "Mobile number",
        phonePlaceholder: "Enter mobile number",
        loanLabel: "Loan you’re interested in",
        loanPlaceholder: "Choose a loan type",
        messageLabel: "Your message",
        messagePlaceholder: "Briefly tell us what you would like help with",
        consent:
          "I agree that Shree Mahavir Fincorp may contact me regarding this enquiry.",
      },
    }),
    block("officeMap", 104, "Office location and map", {
      intro: intro(
        "Find us",
        "Visit the Shree Mahavir Fincorp office.",
        "",
        "Use the map below to find our office.",
      ),
      cardTitle: "Our office location",
      cardCopy: "Office address to be confirmed",
      icon: "MapPin",
      note: "Add the verified office address and map location to view directions.",
      fallbackTitle: "Map location coming soon",
      cta: { label: "Ask for Directions", url: "", enquiry: true },
    }),
  ],
};

const businessEnquiry = (label: string) => ask(label, "business-loan");
export function loanPageFor(loan: Item<"loans">): EditablePage {
  const copy = loanPageContent[loan.slug];
  const photo = loan.photo?.image
    ? loan.photo
    : copy
      ? { image: "/images/" + copy.photo[0], alt: copy.photo[1] }
      : { image: "", alt: "" };
  const enquiry = (label: string) => ask(label, loan.slug);
  return {
    title: loan.title,
    slug: loan.slug,
    seo: { ...emptySeo, title: loan.title, description: loan.description },
    sections: [
      block("hero", 301, "Loan introduction", {
        intro: intro("Loan services", loan.title, "", loan.description),
        cta: enquiry("Enquire About " + loan.title),
        icon: loan.icon,
        cardTitle: "Discuss your requirement",
        cardCopy:
          "Our team can explain the applicable criteria, information needed and next steps.",
      }),
      block("breadcrumb", 302, "Breadcrumb", {
        cardTitle: "Home",
        cardCopy: loan.title,
        cta: { label: "Our Loans", url: "/services", enquiry: false },
      }),
      block("overview", 303, "Loan overview", {
        intro: intro(
          "About " + loan.title,
          copy?.heading || "Explore your funding options",
          "",
          copy?.overview || loan.description,
        ),
        photo,
        cta: enquiry("Speak to Our Team"),
        cardTitle: loan.title,
        cardCopy: "Subject to assessment and applicable terms.",
      }),
      block("highlights", 306, "Service highlights", {
        intro: intro(
          "Service highlights",
          "What to discuss before you apply",
          "",
          "Review the key points with our team before making an enquiry.",
        ),
        items: cards(
          copy?.highlights || [
            [
              "Funding requirement",
              "Explain what you want to fund and how much you need.",
              "IndianRupee",
            ],
            [
              "Applicable terms",
              "Ask about charges, repayment and documentation.",
              "Info",
            ],
            [
              "Assessment",
              "Confirm the steps and information needed for assessment.",
              "Check",
            ],
          ],
        ),
      }),
      block("checklist", 307, "When this option may be relevant", {
        intro: intro(
          "Is this service relevant to you?",
          copy
            ? "When to consider " + loan.title
            : "Decide what to discuss with our team",
          "",
          "Suitability depends on your requirement, circumstances and ability to repay.",
        ),
        items: cards(
          (
            copy?.checks || [
              "You can describe the funding you need.",
              "You want to review the applicable costs and terms.",
            ]
          ).map((check) => [check, "", "Check"]),
        ),
      }),
      block("steps", 304, "Enquiry steps", {
        dark: true,
        intro: intro(
          "Getting started",
          "A clear first step towards your enquiry.",
          "",
          "Start by describing your requirement. The team can explain the next steps.",
        ),
        items: cards([
          [
            "Share your requirement",
            "Tell us what you’d like to fund and how we can help.",
          ],
          [
            "Discuss the details",
            "Ask the team about availability, eligibility, documentation and applicable terms.",
          ],
          [
            "Review the next steps",
            "Review the information and decide whether you would like to proceed.",
          ],
        ]),
      }),
      block("notice", 305, "Important information", {
        icon: "Info",
        cardTitle: "Important information",
        cardCopy:
          "Loan availability, eligibility, charges and terms depend on the applicable policy and individual assessment.",
      }),
      block("questions", 308, loan.title + " FAQs", {
        intro: intro(
          "Frequently asked questions",
          "Questions about " + loan.title + "?",
          "",
          "Confirm the latest product details and conditions with the team before applying.",
        ),
        cardTitle: "Need more information?",
        cardCopy: "Tell us what you would like to discuss.",
        cta: enquiry("Send an Enquiry"),
        items: cards(
          copy?.questions || [
            [
              "How do I enquire?",
              "Use the enquiry form to share your requirement with the team.",
            ],
            [
              "Is approval guaranteed?",
              "Applications are subject to assessment and applicable terms.",
            ],
          ],
        ),
      }),
    ],
  };
}
export const businessLoanPage: EditablePage = {
  slug: "business-loan",
  title: "Business Loan",
  headerOutline: { label: "All Services", url: "/services", enquiry: false },
  seo: {
    ...emptySeo,
    title: "Business Loan Up to ₹5 Lakhs",
    description:
      "Enquire about business loan assistance of up to ₹5 Lakhs, subject to eligibility, assessment and applicable terms.",
  },
  sections: [
    block("hero", 201, "Business Loan hero", {
      intro: intro(
        "Business Financing",
        "Business Loan",
        "Up to ₹5 Lakhs",
        "Need funds to support your business? Shree Mahavir Fincorp offers business loan assistance of up to ₹5 Lakhs for business-related financial requirements. Enquire to understand the applicable eligibility, documentation and loan terms.",
      ),
      cta: businessEnquiry("Enquire About Business Loan"),
      icon: "IndianRupee",
      cardTitle: "Business loan support up to ₹5 Lakhs",
      cardCopy:
        "Discuss your funding requirement with the team and learn about the next steps, subject to assessment and applicable terms.",
    }),
    block("breadcrumb", 202, "Breadcrumb", {
      cardTitle: "Home",
      cardCopy: "Business Loan",
      cta: { label: "Our Loans", url: "/services", enquiry: false },
    }),
    block("overview", 203, "About Business Loan", {
      intro: intro(
        "About Business Loan",
        "Funding support to help your business move forward",
        "",
        "",
      ),
      photo: {
        image: "/images/business-loan.jpg",
        alt: "Small business owner reviewing business finances and planning funding requirements",
      },
      cardTitle: "Up to ₹5 Lakhs",
      cardCopy: "Business loan assistance",
      cta: businessEnquiry("Speak to Our Team"),
      body: "<p>A business loan can provide financial support for planned business expenses, working capital needs and growth-related requirements. Shree Mahavir Fincorp offers loan assistance of up to ₹5 Lakhs, subject to assessment and applicable conditions.</p><p>Business owners may consider this funding for expenses such as purchasing inventory, managing cash flow, buying equipment or improving business operations. Before applying, consider the amount required, repayment capacity and the total cost of borrowing. Shree Mahavir Fincorp can help you understand the enquiry process and information required for assessment.</p><p>The available amount, eligibility, interest rate, repayment period, charges and other conditions depend on the applicant’s profile and the product assessment. Request the latest details and review the complete terms before accepting any loan offer.</p>",
    }),
    block("highlights", 204, "Service highlights", {
      intro: intro(
        "Service highlights",
        "Business funding for your next requirement",
        "",
        "Understand the key points of the Business Loan offering before you make an enquiry.",
      ),
      items: cards([
        [
          "Loan amount up to ₹5 Lakhs",
          "Shree Mahavir Fincorp offers business loan assistance of up to ₹5 Lakhs. The final amount, if any, is subject to eligibility and assessment.",
          "IndianRupee",
        ],
        [
          "For business expenses",
          "You may enquire about funding for working capital, inventory, equipment, business improvements or other eligible business requirements. Permitted end-use should be confirmed before applying.",
          "Building2",
        ],
        [
          "Assessment-based process",
          "The application is reviewed based on the information and documents provided, repayment capacity and applicable criteria. Loan approval is not guaranteed.",
          "Check",
        ],
      ]),
    }),
    block("checklist", 205, "When Business Loan may be relevant", {
      intro: intro(
        "Is this service relevant to you?",
        "Funding for everyday business needs and growth plans",
        "",
        "A Business Loan enquiry may be relevant if you need funds to manage operating expenses or support a planned business activity. Whether the loan is suitable for you depends on your business profile, funding requirement and ability to repay.",
      ),
      items: cards([
        [
          "You need working capital to manage regular business expenses or cash-flow gaps.",
          "",
        ],
        [
          "You are planning to purchase stock, raw materials or inventory for your business.",
          "",
        ],
        [
          "You want to purchase, repair or upgrade tools, machinery or business equipment.",
          "",
        ],
        [
          "You are considering a business improvement, expansion or other planned operational expense.",
          "",
        ],
      ]),
    }),
    block("steps", 206, "How to get started", {
      intro: intro(
        "How to get started",
        "A clear first step towards your enquiry.",
        "",
        "Start with your funding requirement. The team can explain the information needed for assessment; eligibility, terms and approval depend on your application and applicable criteria.",
      ),
      dark: true,
      items: cards([
        [
          "Share your requirement",
          "Share your business type, funding requirement and the amount you are looking for, up to ₹5 Lakhs.",
        ],
        [
          "Understand the details",
          "Ask about the eligibility criteria, required documents, interest rate, repayment period, processing charges and other applicable terms.",
        ],
        [
          "Review your next step",
          "Review the details and documents requested. If you choose to apply, your application will be assessed under the applicable criteria; approval and disbursal are not guaranteed.",
        ],
      ]),
    }),
    block("notice", 207, "Important information", {
      icon: "Info",
      cardTitle: "Important information",
      cardCopy:
        "Eligibility, documentation, interest rates, fees, repayment terms, availability and approval timelines may vary based on the product and individual assessment. Please contact Shree Mahavir Fincorp for current details and review all applicable terms and disclosures before proceeding.",
    }),
    block("questions", 208, "Business Loan FAQs", {
      intro: intro(
        "Frequently asked questions",
        "Questions about Business Loan?",
        "",
        "Find answers to common questions about the Business Loan offering. Confirm the latest product details and conditions with Shree Mahavir Fincorp before applying.",
      ),
      cardTitle: "Need more information?",
      cardCopy:
        "Discuss your business funding requirement and ask about the loan process.",
      cta: businessEnquiry("Send an Enquiry"),
      items: cards([
        [
          "What is Business Loan?",
          "A Business Loan is a form of financing intended to help meet eligible business-related expenses. Shree Mahavir Fincorp offers business loan assistance of up to ₹5 Lakhs, subject to assessment and applicable terms.",
        ],
        [
          "Who can enquire about Business Loan?",
          "Business owners and self-employed individuals with a business funding requirement may enquire. Specific eligibility conditions, business vintage requirements, income criteria and other conditions should be confirmed with Shree Mahavir Fincorp. All applications are subject to assessment.",
        ],
        [
          "Which documents are required?",
          "The document list may vary by applicant and business. Commonly requested information may include identity and address proof, business proof, bank statements and financial details. Confirm the exact checklist with the team.",
        ],
        [
          "How can I apply or make an enquiry?",
          "Click any Enquire button on this page or use the Contact page to submit your details. The team can explain the enquiry process and the next steps.",
        ],
        [
          "Are approval and loan terms guaranteed?",
          "No. Any application is subject to the company’s assessment and applicable policies. Rates, fees, terms and approval timelines may vary. Review the official offer and disclosures before accepting any facility.",
        ],
      ]),
    }),
  ],
};
