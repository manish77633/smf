"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  PanelsTopLeft,
  Landmark,
  Images,
  PanelBottom,
  PanelTop,
  ContactRound,
  Mail,
  Settings,
  Search,
  UserRound,
} from "lucide-react";

const groups = [
  {
    label: "Content",
    links: [
      ["/admin", "Dashboard", LayoutDashboard],
      ["/admin/pages", "Pages", PanelsTopLeft],
      ["/admin/pages?group=loans", "Loan services", Landmark],
      ["/admin/media", "Media library", Images],
    ],
  },
  {
    label: "Shared website",
    links: [
      ["/admin/cms?tab=header", "Header", PanelTop],
      ["/admin/cms?tab=footer", "Footer", PanelBottom],
      ["/admin/cms?tab=contact", "Contact details", ContactRound],
      ["/admin/seo", "SEO", Search],
      ["/admin/cms?tab=general", "Site settings", Settings],
    ],
  },
  {
    label: "Operations",
    links: [
      ["/admin/enquiries", "Enquiries", Mail],
      ["/admin/account", "Account", UserRound],
    ],
  },
] as const;
export default function AdminNavigation() {
  const pathname = usePathname(), search = useSearchParams();
  const tab = search.get("tab");
  const pagePath = pathname.startsWith("/admin/pages");
  const loanServices = (pagePath && search.get("group") === "loans") ||
    (pathname === "/admin/cms" && tab === "loans");
  const sharedTabs = ["loans", "header", "footer", "contact", "general", "seo", "banner", "whatsapp"];
  const [intended, setIntended] = useState("");
  return (
    <nav aria-label="Admin navigation" className="admin-navigation">
      {groups.map(({ label: groupLabel, links }) => (
        <div key={groupLabel} className="admin-nav-group" role="group" aria-label={groupLabel}>
          <p aria-hidden>{groupLabel}</p>
          {links.map(([href, label, Icon]) => {
            let active = pathname === href;
            if (href === "/admin/pages?group=loans") active = loanServices;
            else if (href === "/admin/pages") {
              active = (pagePath && !loanServices) ||
                (pathname === "/admin/cms" && !sharedTabs.includes(tab || ""));
            } else if (href === "/admin/seo") {
              active = pathname.startsWith("/admin/seo") || (pathname === "/admin/cms" && tab === "seo");
            } else if (href.startsWith("/admin/cms?")) {
              const activeTab = tab === "banner" ? "header" : tab === "whatsapp" ? "general" : tab;
              active = pathname === "/admin/cms" && href.endsWith("=" + activeTab);
            }
            return (
              <Link
                key={href}
                href={href}
                prefetch={href === "/admin/pages" || (intended === href && href !== "/admin" && href !== "/admin/enquiries") ? true : undefined}
                onPointerEnter={() => setIntended(href)}
                onFocus={() => setIntended(href)}
                onPointerDown={() => setIntended(href)}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={16} aria-hidden />
                {label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
