type LoanCopy = {
  photo: [string, string];
  heading: string;
  overview: string;
  highlights: string[][];
  checks: string[];
  questions: string[][];
};
export const loanPageContent: Record<string, LoanCopy> = {
  "gold-loan": {
    photo: ["gold-loan.jpg", "Gold ring on a white surface"],
    heading: "Explore funding against eligible gold jewellery",
    overview:
      "A Gold Loan enquiry starts with the jewellery you may wish to offer and the amount you need. Ask the team how the jewellery is assessed, what documents are required, and how repayment and release of the pledged items work.",
    highlights: [
      [
        "Jewellery assessment",
        "Ask which jewellery can be assessed and how its value is determined.",
        "Gem",
      ],
      [
        "Funding for a planned need",
        "Explain the expense you would like to cover and the amount you need.",
        "IndianRupee",
      ],
      [
        "Repayment and release",
        "Review repayment dates, charges and the process for getting pledged items back.",
        "Calendar",
      ],
    ],
    checks: [
      "You own jewellery you would like to have assessed.",
      "You know how much funding you need.",
      "You want to review the terms for repayment and return of the jewellery.",
    ],
    questions: [
      [
        "Which items can I offer for assessment?",
        "Ask the team which items meet the applicable product criteria.",
      ],
      [
        "How is gold assessed?",
        "The team can explain the valuation process and what information it needs.",
      ],
      [
        "When can jewellery be released?",
        "Confirm the repayment, settlement and release terms before proceeding.",
      ],
    ],
  },
  "construction-loan": {
    photo: ["construction-loan.jpg", "Construction worker on a building frame"],
    heading: "Plan funding around your construction milestones",
    overview:
      "Share the project scope, estimated costs and construction timeline. The team can explain what plans, property documents and cost estimates may be needed, and whether any funding would be linked to project stages.",
    highlights: [
      [
        "Project scope",
        "Explain what you plan to build or improve.",
        "Building2",
      ],
      [
        "Budget and milestones",
        "Prepare an estimate and the dates you expect to need funds.",
        "Calendar",
      ],
      [
        "Documents and disbursement",
        "Ask about property documentation, progress checks and applicable release conditions.",
        "Info",
      ],
    ],
    checks: [
      "You have a planned build or improvement with a defined scope.",
      "You have an estimate or can describe the major project costs.",
      "You want to understand the documentation and funding stages.",
    ],
    questions: [
      [
        "Can I enquire about an improvement project?",
        "Describe your project so the team can explain what may be eligible.",
      ],
      [
        "What plans or estimates should I prepare?",
        "Ask whether approvals, cost estimates or contractor details are needed for your enquiry.",
      ],
      [
        "How would funds be released?",
        "Any release schedule depends on the applicable terms and assessment.",
      ],
    ],
  },
  "loan-against-property": {
    photo: ["home.jpg", "House model and keys"],
    heading: "Understand financing against eligible property",
    overview:
      "Start with the property type, ownership details and your funding requirement. Ask how valuation and documents are reviewed, which charges apply, and what it would mean to offer your property as security.",
    highlights: [
      [
        "Property details",
        "Discuss the property type and ownership before submitting documentation.",
        "House",
      ],
      [
        "Valuation and assessment",
        "Ask how the property and your ability to repay are reviewed.",
        "Landmark",
      ],
      [
        "Terms and responsibilities",
        "Review repayment, charges and obligations related to the security before accepting an offer.",
        "Info",
      ],
    ],
    checks: [
      "You want to explore financing against a property you own or jointly own.",
      "You are ready to discuss ownership and any existing obligations.",
      "You want to compare repayment terms and understand the effect of offering security.",
    ],
    questions: [
      [
        "What types of property can be assessed?",
        "Confirm eligible property types with the team.",
      ],
      [
        "Do joint owners need to be involved?",
        "Ownership and consent requirements depend on the property and applicable terms.",
      ],
      [
        "What should I check before accepting?",
        "Review the total cost, repayment schedule and your obligations related to the property.",
      ],
    ],
  },
  "group-loan": {
    photo: ["team.jpg", "Colleagues discussing plans around a table"],
    heading: "Discuss financing around your group’s shared goal",
    overview:
      "Explain what the members want to fund together and how the group is organised. Confirm who may participate, what information is needed from each person, and how any repayment responsibilities would be assigned.",
    highlights: [
      [
        "Shared purpose",
        "Describe the common funding need and who would participate.",
        "UsersRound",
      ],
      [
        "Member information",
        "Ask about the information and criteria that apply to each participant.",
        "Info",
      ],
      [
        "Repayment roles",
        "Clarify who would be responsible for repayments under the proposed terms.",
        "Check",
      ],
    ],
    checks: [
      "Your group has a shared activity or expense in mind.",
      "Members are ready to discuss how they would participate.",
      "Everyone wants to understand their responsibilities before proceeding.",
    ],
    questions: [
      [
        "How should a group start an enquiry?",
        "Share the purpose, approximate number of members and estimated funding need.",
      ],
      [
        "Will each member be assessed?",
        "The team can confirm what the relevant product requires from participants.",
      ],
      [
        "Who would be responsible for repayment?",
        "Repayment responsibilities depend on the agreement. Members should review them before accepting.",
      ],
    ],
  },
  "personal-loan": {
    photo: ["checklist.jpg", "People reviewing paperwork at a table"],
    heading: "Explore financing for a planned personal expense",
    overview:
      "Tell the team what you need to cover, how much you need and when. Before making a decision, compare the proposed monthly payment, repayment period, fees and total repayment with your budget.",
    highlights: [
      [
        "Personal requirement",
        "Explain the expense and the amount you want to discuss.",
        "Heart",
      ],
      [
        "Budget and repayment",
        "Ask about payment amounts, the repayment period and the total expected cost.",
        "Calendar",
      ],
      [
        "Application requirements",
        "Confirm what information and documents are needed for assessment.",
        "Info",
      ],
    ],
    checks: [
      "You have a personal expense in mind and an estimated amount.",
      "You have considered what monthly payment fits your budget.",
      "You want to review the costs and terms before applying.",
    ],
    questions: [
      [
        "What can I discuss with the team?",
        "Explain the personal expense so the team can advise on applicable options.",
      ],
      [
        "Which documents may be needed?",
        "The team can confirm the documentation based on your situation and the product.",
      ],
      [
        "How should I compare terms?",
        "Check the monthly payment, charges, repayment period and total repayment together.",
      ],
    ],
  },
};
