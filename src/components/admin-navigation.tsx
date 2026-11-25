"use client";
import Link from "next/link";
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
  UserRound,
} from "lucide-react";

const links = [
  ["/admin", "Overview", LayoutDashboard],
  ["/admin/pages", "Pages", PanelsTopLeft],
  ["/admin/cms?tab=loans", "Loan Cards", Landmark],
  ["/admin/media", "Media Library", Images],
  ["/admin/cms?tab=header", "Shared Header", PanelTop],
  ["/admin/cms?tab=contact", "Contact Details", ContactRound],
  ["/admin/cms?tab=footer", "Shared Footer", PanelBottom],
  ["/admin/enquiries", "Enquiries", Mail],
  ["/admin/cms?tab=general", "Site Settings", Settings],
  ["/admin/account", "Account", UserRound],
] as const;
export default function AdminNavigation() {
  const pathname = usePathname(),
    tab = useSearchParams().get("tab");
  return (
    <nav
      aria-label="Admin navigation"
      className="grid grid-cols-2 gap-0.5 p-2.5 sm:grid-cols-4 lg:grid-cols-1"
    >
      {links.map(([href, label, Icon]) => {
        const active = href.includes("?")
          ? pathname === "/admin/cms" && href.endsWith("=" + tab)
          : href === "/admin/pages"
            ? pathname.startsWith("/admin/pages") ||
              (pathname === "/admin/cms" &&
                !["loans", "header", "footer", "contact", "general"].includes(
                  tab || "",
                ))
            : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              "flex min-h-8 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors hover:bg-white/10 hover:text-white " +
              (active ? "bg-white/15 font-bold text-white" : "text-blue-100")
            }
          >
            <Icon size={15} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
