import type {
  Action,
  Draft,
  Heading,
  Records,
  Section,
  SectionKey,
  Content,
} from "./content";
const go = (label: string, url: string): Action => ({
  label,
  url,
  enquiry: false,
});
const ask = (label: string, url = ""): Action => ({
  label,
  url,
  enquiry: true,
});
const h = (
  eyebrow: string,
  heading: string,
  description = "",
  highlight = "",
): Heading => ({ eyebrow, heading, description, highlight });
const photo = (file: string, alt: string) => ({
  image: file ? "/images/" + file : "",
  alt,
});
const logo = photo("smf.svg", "Shree Mahavir Fincorp");
const details = {
  email: "shreemahavirfincorp@gmail.com",
  phone: "",
  address: "2nd Floor, Shop No. 3, New Light Colony, Gopalpura Bypass, Tonk Road, Jaipur, Rajasthan",
};
const ordered = (order: number, visible = true) => ({ visible, order });
const tiles = (items: string[][]) =>
  items.map(([label, icon], order) => ({ label, icon, ...ordered(order) }));
const nav = (items: string[][]) =>
  items.map(([label, url], order) => ({
    ...go(label, url),
    ...ordered(order),
  }));
export const homeHighlights: NonNullable<Content<"trust">["homeHighlights"]> = {
  supportHeading: "What do you need financial support for?",
  cards: [
    ["shop", "Store", "Grow Your Business", "Need funds to expand your shop or purchase inventory?", "Explore Business Loan", "/business-loan"],
    ["sewing", "Scissors", "Start Something New", "Need financial support for your entrepreneurial journey?", "Explore Loan Options", "/services"],
    ["dairy", "Milk", "Expand Your Dairy", "Looking to purchase cattle or grow your dairy business?", "Explore Loan Options", "/services"],
    ["family", "UsersRound", "Meet Personal Needs", "Need financial support for education, healthcare or other important expenses?", "Explore Personal Loan", "/personal-loan"],
  ].map(([file, icon, title, description, label, url], order) => ({
    ...ordered(order), icon, title, description, photo: photo("reference-" + file + ".webp", ""), cta: go(label, url),
  })),
  productsHeading: "Our Loan Products",
  products: ["business-loan", "personal-loan", "loan-against-property", "gold-loan"].map((slug, order) => ({ slug, ...ordered(order) })),
  emiTitle: "Calculate Your EMI",
  emiDescription: "Check your estimated EMI in seconds.",
  emiLabel: "EMI Calculator",
  emiLink: "/emi-calculator",
  emiPhoto: photo("reference-emi.webp", ""),
  reasonsHeading: "Why Choose SMF?",
  reasons: [
    ["Customer-Centric Approach", "UsersRound", "Solutions based on your real needs."],
    ["Simple Process", "FileText", "Clear documentation and easy application."],
    ["Personal Guidance", "Headset", "Our team supports you at every step."],
    ["Local Understanding", "MapPin", "We understand the financial needs of our communities in Rajasthan."],
  ].map(([label, icon, description], order) => ({ ...ordered(order), label, icon, description })),
};
const section = <K extends SectionKey>(
  type: K,
  label: string,
  content: Content<K>,
  visible = true,
) => ({ type, id: type, label, content, visible }) as Section;
export const emptySeo = {
  title: "",
  description: "",
  canonical: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  index: true,
  follow: true,
  sitemap: true,
};
const loanTitles = [
  "Gold Loan",
  "Business Loan",
  "Construction Loan",
  "Loan Against Property",
  "Group Loan",
  "Personal Loan",
];
const loanDescriptions = [
  "Explore financing against eligible gold assets for planned and unexpected needs.",
  "Support your next business milestone, from daily needs to new opportunities.",
  "Take the next step towards building, improving or expanding your space.",
  "Understand the possibilities of borrowing against eligible property.",
  "Financing options designed around group-based needs and shared progress.",
  "Get support for life’s important moments, with guidance along the way.",
];
const questions = [
  [
    "What types of loans do you offer?",
    "Explore Gold Loan, Business Loan, Construction Loan, Loan Against Property, Group Loan and Personal Loan options. Our team can help you understand availability and applicable terms.",
  ],
  [
    "How do I start a loan enquiry?",
    "Select a loan and send us an enquiry. Tell us what you’re working towards so our team can guide you through the next step.",
  ],
  [
    "Which documents will I need?",
    "Documents depend on the loan and your circumstances. Our team can explain what is needed after reviewing your enquiry.",
  ],
  [
    "How long does loan approval take?",
    "Timing depends on the loan, documentation and assessment. Ask our team for information about your enquiry.",
  ],
  [
    "Are interest rates and eligibility the same for everyone?",
    "Rates, terms and eligibility depend on the loan and individual assessment. Speak with our team to understand what may apply.",
  ],
  [
    "Can I apply online?",
    "You can start by sending an online enquiry. Our team will explain the next steps.",
  ],
];
export const records: Records = {
  loans: loanTitles.map((title, order) => ({
    title,
    slug: title.toLowerCase().replaceAll(" ", "-"),
    icon: [
      "Gem",
      "Building2",
      "House",
      "PanelsTopLeft",
      "UsersRound",
      "ArrowUpRight",
    ][order],
    red: order % 2 === 1,
    description: loanDescriptions[order],
    cta: go(
      order === 3 ? "Explore Loan Options" : "Explore " + title,
      "/" + title.toLowerCase().replaceAll(" ", "-"),
    ),
    featured: order === 1,
    ...ordered(order),
  })),
  videos: [
    [
      "Understanding your loan options",
      "Write down what the money is for, how much you need and when. Ask about fees and total repayment.",
      "loan-options",
      "compare.jpg",
      "A laptop and payment card",
    ],
    [
      "Preparing your paperwork",
      "Ask for a document checklist, gather recent paperwork and use the lender’s official channel to share it.",
      "documents",
      "checklist.jpg",
      "People reviewing documents",
    ],
    [
      "Planning a monthly repayment",
      "Start with reliable income, subtract regular costs and current payments, and leave room for unexpected expenses.",
      "monthly-budget",
      "home.jpg",
      "House model beside keys",
    ],
  ].map(([title, description, clip, image, alt], order) => ({
    title,
    description,
    youtube: "/videos/" + clip + ".mp4",
    thumbnail: photo(image, alt),
    ...ordered(order),
  })),
  testimonials: [
    [
      "demo-rahul",
      "Rahul K.",
      "The team explained the process clearly and helped me understand the documents I needed. The communication made a difference.",
    ],
    [
      "demo-sunita",
      "Sunita P.",
      "I appreciated having someone walk me through the options instead of rushing me. It felt like my questions mattered.",
    ],
    [
      "demo-amit",
      "Amit M.",
      "The process was explained in simple language and I knew what the next step would be. Helpful and professional service.",
    ],
  ].map(([slug, name, review], order) => ({
    slug,
    name,
    review,
    avatar: photo("", ""),
    rating: 5,
    designation: "Customer review",
    example: true,
    consent: false,
    ...ordered(order),
  })),
  blogs: [
    [
      "Preparing for a loan: a simple checklist",
      "financial-basics",
      "Learn what information to gather before starting a loan enquiry.",
      "checklist.jpg",
      "People reviewing paperwork at a table",
      "Financial Basics",
    ],
    [
      "How to compare loan options thoughtfully",
      "compare-loan-options",
      "Questions to ask about costs, repayment, terms and suitability.",
      "compare.jpg",
      "Person using a card and laptop",
      "Smart Borrowing",
    ],
    [
      "Building a realistic plan for a big goal",
      "plan-for-a-big-goal",
      "Map your priorities and prepare for the costs that come with them.",
      "home.jpg",
      "House model beside keys",
      "Planning Ahead",
    ],
  ].map(([title, slug, excerpt, file, alt, category], order) => ({
    title,
    slug,
    excerpt,
    photo: photo(file, alt),
    category,
    author: "",
    minutes: [5, 4, 6][order],
    date: "",
    body: [
      "<p>Start by writing down your borrowing goal and estimated budget. Prepare a list of questions about eligibility, documentation and repayment before speaking with the lender.</p>",
      "<p>Ask each lender for written details on fees, repayment schedules and the total cost. Compare options for the amount and timeframe you actually need.</p>",
      "<p>List the costs you can anticipate and leave room for surprises. Think through the timing of each cost and check what a manageable repayment would look like for you.</p>",
    ][order],
    seo: { ...emptySeo },
    featured: true,
    ...ordered(order),
  })),
  faqs: questions.map(([question, answer], order) => ({
    question,
    answer,
    ...ordered(order),
  })),
};
const slides = [
  [
    "",
    "Big Dreams Begin With",
    "Small Steps.",
    "Financial solutions to help you grow your business, start something new or meet personal needs.",
    "Explore Our Loans",
  ],
  [
    "FOR YOUR AMBITION",
    "Give your business room to",
    "grow.",
    "Explore financing options that can help you manage working capital, invest in opportunities and move forward with clarity.",
    "Explore Business Loans",
  ],
  [
    "FOR YOUR PLANS",
    "Take the next step with",
    "confidence.",
    "Let’s talk about your plans and the financing options that may fit.",
    "Talk to Our Team",
  ],
].map(([label, title, highlight, copy, cta], order) => ({
  ...ordered(order),
  intro: h(label, title, copy, highlight),
  photo: photo("reference-hero.webp", "Tailor beside her sewing machine"),
  opacity: order === 0 ? 0.08 : 0.22,
  cta:
      order === 1
      ? ask(cta, "#business-loan")
      : go(cta, order === 0 ? "#loans" : "#contact"),
  trust: tiles([
    ["Simple Process", "Handshake"],
    ["Quick Support", "Zap"],
    ["Trusted & Transparent", "ShieldCheck"],
  ]),
  advisor: h(
    "",
    "Talk to Our Team",
    "Tell us what you’re working towards and we’ll help you understand the next step.",
  ),
  advisorCta: ask("Talk to Our Team"),
  disclaimer:
    "Loan eligibility and terms are subject to assessment and applicable policies.",
}));
export const draft: Draft = {
  page: {
    title: "Home",
    slug: "home",
    status: "published",
    seo: { ...emptySeo },
  },
  settings: {
    websiteName: "Shree Mahavir Fincorp",
    defaultTitle: "Shree Mahavir Fincorp | Loan Solutions",
    titleTemplate: "%s | Shree Mahavir Fincorp",
    defaultDescription:
      "Explore financing options for personal, property and business goals with Shree Mahavir Fincorp.",
    baseUrl: "",
    defaultImage: "",
    favicon: "/images/smf.svg",
    organization: "Shree Mahavir Fincorp Credit Co-Operative Society Ltd.",
    logo: logo.image,
    details,
    profiles: [],
    googleVerification: "",
    bingVerification: "",
    index: true,
    follow: true,
    whatsapp: {
      enabled: false,
      number: "",
      message: "Hello, I’d like to ask about loan options.",
      tooltip: "Chat on WhatsApp",
      position: "right",
      desktop: true,
      mobile: true,
    },
    redirects: [],
  },
  sections: [
    section("bar", "Top information bar", {
      left: "A Trusted Financial Partner for Individuals & Small Businesses",
      right: "Need help?",
      icon: "Phone",
      cta: go("Contact Our Team", "/contact"),
    }),
    section("header", "Header & Navigation", {
      logo,
      items: nav([
        ["Home", "#home"],
        ["Our Loans", "/services"],
        ["Customer Stories", "#stories"],
        ["Financial Saathi", "#videos"],
        ["About Us", "#about"],
        ["Contact", "/contact"],
      ]),
      loanMenu: true,
      loanMenuUrl: "/services",
      outline: go("English  |  हिन्दी", "#home"),
      primary: ask("Apply Now"),
    }),
    section("hero", "Hero Slides", {
      autoplay: false,
      initialSlide: 1,
      delay: 7000,
      slides,
    }),
    section("trust", "Trust Highlights", {
      homeHighlights,
      caption: "Finance that moves with you",
      items: tiles([
        ["Personal guidance", "Compass"],
        ["Clear communication", "ArrowUpRight"],
        ["People-first approach", "Heart"],
        ["Support at every step", "Check"],
      ]),
    }),
    section(
      "loans",
      "Loan Services",
      h(
        "EXPLORE OUR SOLUTIONS",
        "A loan for the goal you’re",
        "Every journey is different. Explore our range of lending solutions and connect with our team to understand what may work for you.",
        "working towards.",
      ),
    ),
    section("about", "About Company", {
      ...h(
        "A LITTLE ABOUT US",
        "Helping you move forward, one",
        "",
        "step at a time.",
      ),
      photo: photo("team.jpg", "Colleagues at work in a shared office"),
      badge: "People",
      badgeAccent: "first.",
      badgeCopy: "Finance with understanding, not just numbers.",
      body: "<p>Shree Mahavir Fincorp Credit Co-Operative Society Ltd. (SMF Finance) serves its members with personal, property and construction loans.</p><p>Our approach is built around clear communication, personal attention and making the process easier to navigate. Tell us what matters to you and we’ll help you understand your next steps.</p>",
      features: tiles([
        ["Customer-focused service", "Check"],
        ["Clear communication", "Check"],
        ["Multiple loan options", "Check"],
        ["Guidance when you need it", "Check"],
      ]),
      cta: go("Get to Know Us", "#contact"),
    }),
    section("statistics", "Statistics", {
      ...h(
        "OUR APPROACH IN NUMBERS",
        "Every number starts with a person.",
        "Explore our loan options and the resources available to help you prepare for an enquiry.",
      ),
      items: [
        ["12", "Years of experience", "+"],
        ["8,500", "Customers supported", "+"],
        ["6", "Loan solutions", ""],
        ["25", "Service locations", "+"],
      ].map(([value, label, suffix], order) => ({
        value,
        label: String(label),
        suffix,
        prefix: "",
        verified: true,
        ...ordered(order),
      })),
    }),
    section(
      "videos",
      "Videos",
      h(
        "WATCH & LEARN",
        "Financial clarity, one video at a time.",
        "Explore loan information and prepare questions for your next conversation.",
      ),
    ),
    section("testimonials", "Testimonials", {
      ...h(
        "CUSTOMER VOICES",
        "Trust is built in the little things.",
        "These sample reviews are for illustration.",
      ),
      caption: "Stories that inspire us to do better.",
    }),
    section("blogs", "Blogs & Insights", {
      ...h(
        "FROM OUR JOURNAL",
        "Small insights. Better decisions.",
        "Explore practical ideas for preparing for a loan and planning your next step.",
      ),
      caption: "Ideas to help you make informed decisions.",
    }),
    section("faqs", "FAQs", {
      ...h(
        "GOOD TO KNOW",
        "Questions are a great place to start.",
        "Here are a few common questions. Our team can help with details specific to your circumstances and loan enquiry.",
      ),
      supportTitle: "Still need a hand?",
      supportCopy: "Talk to our team and get help understanding the next step.",
      cta: ask("Ask Us a Question"),
    }),
    section("contact", "Contact Management", {
      ...h(
        "GET IN TOUCH",
        "Let’s talk about what’s next.",
        "Have a question or want to understand your options? Reach out and our team can guide you through the next step.",
      ),
      details: { ...details, hours: "", directions: "" },
      hoursLabel: "Office hours",
      emailLabel: "Email us",
      phoneLabel: "Call us",
      addressLabel: "Visit us",
      formTitle: "Send us an enquiry",
      formCopy: "Fill in the form and we’ll know how best to help.",
      nameLabel: "Your name",
      namePlaceholder: "Full name",
      phoneLabelForm: "Phone number",
      phonePlaceholder: "Mobile number",
      emailLabelForm: "Email address",
      emailPlaceholder: "you@example.com",
      loanLabel: "Loan type",
      loanPlaceholder: "Select a loan",
      messageLabel: "How can we help?",
      messagePlaceholder: "Tell us a little about your requirement",
      consent: "I agree to be contacted about this enquiry.",
      disclaimer: "Your details will be used to respond to this enquiry.",
      button: "Submit Enquiry",
      success: "Your enquiry was received. Our team will be in touch.",
      recipient: "",
      options: [],
    }),
    section("banner", "Final CTA", {
      heading: "Ready to take your next step?",
      description:
        "Tell us your goal. Let’s explore the possibilities together.",
      cta: ask("Apply for a Loan"),
    }),
    section("footer", "Footer Management", {
      logo: photo("smf-footer.svg", "Shree Mahavir Fincorp"),
      description:
        "Financial support that starts with understanding. Explore lending options for your personal, property and business goals.",
      columns: [
        {
          title: "Explore",
          links: nav([
            ["About Us", "#about"],
            ["Our Loan Services", "/services"],
            ["Customer Stories", "#stories"],
            ["Blog & Insights", "#insights"],
            ["FAQs", "#faqs"],
          ]),
        },
        {
          title: "Loan Services",
          links: loanTitles.map((label, order) => ({
            ...go(label, "/" + label.toLowerCase().replaceAll(" ", "-")),
            ...ordered(order),
          })),
        },
      ],
      contactTitle: "Contact",
      details,
      socials: [
        ["Facebook", "Facebook"],
        ["Instagram", "Camera"],
        ["LinkedIn", "LinkedIn"],
        ["YouTube", "Play"],
      ].map(([label, icon], order) => ({
        ...go(label, ""),
        icon,
        ...ordered(order),
      })),
      legal: nav([
        ["Privacy Policy", ""],
        ["Terms & Conditions", ""],
      ]),
      contactFields: [],
      note: "Loan terms are subject to assessment and applicable policies.",
      backToTop: true,
      copyright: "© {year} Shree Mahavir Fincorp. All rights reserved.",
    }),
  ],
};
