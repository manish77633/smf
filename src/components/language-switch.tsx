"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const currentLanguage = () => document.documentElement.lang;
const serverLanguage = () => "en";

export function LanguageSwitch() {
  const language = useSyncExternalStore(subscribe, currentLanguage, serverLanguage);
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-rule px-3 py-2" aria-label="Website language">
      {["en", "hi"].map((code) => (
        <button key={code} type="button" lang={code} aria-pressed={language === code}
          className="aria-pressed:font-bold aria-pressed:text-brand"
          onClick={() => {
            document.cookie = "smf-language=" + code + "; Path=/; Max-Age=31536000; SameSite=Lax";
            window.location.reload();
          }}>
          {code === "en" ? "English" : "हिन्दी"}
        </button>
      ))}
    </div>
  );
}
