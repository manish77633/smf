import { cookies } from "next/headers";

const hindi: Record<string, string> = {
  "Home": "होम",
  "Our Loans": "हमारे ऋण",
  "Our Loan Services": "हमारी ऋण सेवाएँ",
  "Customer Stories": "ग्राहकों की कहानियाँ",
  "Financial Saathi": "वित्तीय साथी",
  "Insights": "जानकारी",
  "About Us": "हमारे बारे में",
  "Contact": "संपर्क",
  "Contact Us": "हमसे संपर्क करें",
  "Business Loan": "व्यवसाय ऋण",
  "Personal Loan": "व्यक्तिगत ऋण",
  "Gold Loan": "स्वर्ण ऋण",
  "Group Loan": "समूह ऋण",
  "Construction Loan": "निर्माण ऋण",
  "Loan Against Property": "संपत्ति के बदले ऋण",
  "Apply Now": "अभी आवेदन करें",
  "Talk to Our Team": "हमारी टीम से बात करें",
  "Contact Our Team": "हमारी टीम से संपर्क करें",
  "Explore Our Loans": "हमारे ऋण विकल्प देखें",
  "Big Dreams Begin With": "बड़े सपनों की शुरुआत",
  "Small Steps.": "छोटे कदमों से होती है।",
  "Financial solutions to help you grow your business, start something new or meet personal needs.": "व्यवसाय बढ़ाने, नई शुरुआत करने और निजी ज़रूरतें पूरी करने के लिए वित्तीय समाधान।",
  "Quick Support": "त्वरित सहायता",
  "Trusted & Transparent": "भरोसेमंद और पारदर्शी",
  "What do you need financial support for?": "आपको किस काम के लिए वित्तीय सहायता चाहिए?",
  "Grow Your Business": "अपना व्यवसाय बढ़ाएँ",
  "Start Something New": "कुछ नया शुरू करें",
  "Expand Your Dairy": "अपनी डेयरी बढ़ाएँ",
  "Meet Personal Needs": "निजी ज़रूरतें पूरी करें",
  "Our Loan Products": "हमारे ऋण विकल्प",
  "Calculate Your EMI": "अपनी मासिक किस्त जानें",
  "EMI Calculator": "ईएमआई कैलकुलेटर",
  "Why Choose SMF?": "SMF क्यों चुनें?",
  "Simple Process": "सरल प्रक्रिया",
  "Personal Guidance": "व्यक्तिगत मार्गदर्शन",
  "Local Understanding": "स्थानीय समझ",
  "Customer-Centric Approach": "ग्राहक केंद्रित सेवा",
  "Explore Loan Options": "ऋण विकल्प देखें",
  "Explore Business Loan": "व्यवसाय ऋण देखें",
  "Explore Personal Loan": "व्यक्तिगत ऋण देखें",
  "Check your estimated EMI in seconds.": "कुछ ही सेकंड में अपनी अनुमानित मासिक किस्त जानें।",
  "Need funds to expand your shop or purchase inventory?": "दुकान बढ़ाने या नया माल खरीदने के लिए धन चाहिए?",
  "Need financial support for your entrepreneurial journey?": "अपना काम शुरू करने के लिए वित्तीय सहायता चाहिए?",
  "Looking to purchase cattle or grow your dairy business?": "पशु खरीदना चाहते हैं या डेयरी व्यवसाय बढ़ाना चाहते हैं?",
  "Need financial support for education, healthcare or other important expenses?": "शिक्षा, इलाज या दूसरे ज़रूरी खर्चों के लिए वित्तीय सहायता चाहिए?",
  "Solutions based on your real needs.": "आपकी ज़रूरतों के हिसाब से समाधान।",
  "Clear documentation and easy application.": "स्पष्ट दस्तावेज़ और आसान आवेदन।",
  "Our team supports you at every step.": "हमारी टीम हर कदम पर आपकी मदद करती है।",
  "We understand the financial needs of our communities in Rajasthan.": "हम राजस्थान के लोगों की वित्तीय ज़रूरतें समझते हैं।",
  "Explore our solutions": "हमारे वित्तीय विकल्प देखें",
  "Find a loan option for the": "अपने अगले कदम के लिए",
  "next step.": "सही ऋण विकल्प चुनें।",
  "Loan services": "ऋण सेवाएँ",
  "Discuss your requirement": "अपनी ज़रूरत पर बात करें",
  "Call us": "हमें कॉल करें",
  "Visit our office": "हमारे कार्यालय आएँ",
  "Email us": "हमें ईमेल करें",
  "Need help?": "मदद चाहिए?",
};

const fields = new Set(["title", "heading", "highlight", "description", "eyebrow", "label", "left", "right", "caption", "cardTitle", "cardCopy", "supportHeading", "productsHeading", "emiTitle", "emiDescription", "emiLabel", "reasonsHeading"]);

export async function publicLanguage() {
  return (await cookies()).get("smf-language")?.value === "hi" ? "hi" : "en";
}

export function localize<T>(content: T, language: string): T {
  if (language !== "hi") return content;
  function visit(value: unknown, field?: string): unknown {
    if (typeof value === "string" && field && fields.has(field)) return hindi[value] ?? value;
    if (Array.isArray(value)) return value.map((entry) => visit(entry));
    if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype)
      return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, visit(entry, key)]));
    return value;
  }
  return visit(content) as T;
}
