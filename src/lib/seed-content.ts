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
const details = { email: "", phone: "", address: "" };
const ordered = (order: number, visible = true) => ({ visible, order });
const tiles = (items: string[][]) =>
  items.map(([label, icon], order) => ({ label, icon, ...ordered(order) }));
const nav = (items: string[][]) =>
  items.map(([label, url], order) => ({
    ...go(label, url),
    ...ordered(order),
  }));
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
      "A simple introduction to choosing a loan type.",
    ],
    [
      "Plan your next financial step",
      "Helpful ideas for preparing before you apply.",
    ],
    ["Your questions, answered", "Make room for FAQs and customer education."],
  ].map(([title, description], order) => ({
    title,
    description,
    youtube: "",
    thumbnail: photo("", ""),
    ...ordered(order, false),
  })),
  testimonials: [],
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
    "FOR YOUR NEXT STEP",
    "Finance for what’s",
    "next.",
    "Explore options for your personal, property and business goals.",
    "Explore Loans",
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
  photo: photo("hero.jpg", "Colleagues reviewing financial plans"),
  opacity: 0.78,
  cta:
    order === 1
      ? ask(cta, "#business-loan")
      : go(cta, order === 0 ? "#loans" : "#contact"),
  trust: tiles([
    ["Guidance at every step", "Check"],
    ["Clear next steps", "Check"],
  ]),
  advisor: h(
    "START A CONVERSATION",
    "Your plans deserve a plan",
    "Tell us what you’re working towards and we’ll help you understand the next step.",
  ),
  advisorCta: ask("Speak to an Advisor"),
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
    organization: "Shree Mahavir Fincorp",
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
      left: "Finance solutions for your next big step",
      right: "Need help?",
      icon: "Sparkles",
      cta: go("Talk to our team", "#contact"),
    }),
    section("header", "Header & Navigation", {
      logo,
      items: nav([
        ["Home", "#home"],
        ["Our Loans", "/services"],
        ["About Us", "#about"],
        ["Customer Stories", "#stories"],
        ["Insights", "#insights"],
        ["Contact", "/contact"],
      ]),
      loanMenu: true,
      loanMenuUrl: "/services",
      outline: go("Explore Loans", "/services"),
      primary: ask("Apply Now"),
    }),
    section("hero", "Hero Slides", {
      autoplay: false,
      initialSlide: 2,
      delay: 7000,
      slides,
    }),
    section("trust", "Trust Highlights", {
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
      body: "<p>At Shree Mahavir Fincorp, we believe financial support should begin with listening. Whether you’re planning for your family, growing a business or taking on a new project, we’re here to help you explore suitable lending options and understand the way ahead.</p><p>Our approach is built around clear communication, personal attention and making the process easier to navigate. Tell us what matters to you and we’ll help you understand your next steps.</p>",
      features: tiles([
        ["Customer-focused service", "Check"],
        ["Clear communication", "Check"],
        ["Multiple loan options", "Check"],
        ["Guidance when you need it", "Check"],
      ]),
      cta: go("Get to Know Us", "#contact"),
    }),
    section("statistics", "Statistics", {
      ...h("OUR APPROACH IN NUMBERS", "Every number starts with a person."),
      items: [
        ["12", "+", "Years of experience"],
        ["8,500", "+", "Customers supported"],
        ["6", "", "Loan solutions"],
        ["25", "+", "Service locations"],
      ].map(([value, suffix, label], order) => ({
        value,
        suffix,
        label,
        prefix: "",
        verified: false,
        ...ordered(order, false),
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
      ...h("CUSTOMER VOICES", "Trust is built in the little things."),
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
      details,
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
