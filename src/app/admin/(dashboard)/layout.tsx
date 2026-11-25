import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { adminEmail } from "@/auth";
import { logout } from "../actions";
import AdminNavigation from "@/components/admin-navigation";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await adminEmail();
  if (!email) redirect("/admin/login");
  return (
    <div className="admin-workspace min-h-screen lg:grid lg:grid-cols-[214px_minmax(0,1fr)]">
      <aside className="flex flex-col bg-ink text-white lg:sticky lg:top-0 lg:h-dvh lg:overflow-auto">
        <Link
          href="/admin"
          className="flex min-h-[59px] items-center gap-2.5 border-b border-white/10 px-4 py-2.5"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/20 bg-white/10">
            <LayoutDashboard size={16} />
          </span>
          <span>
            <strong className="admin-brand-title block">SMF Admin</strong>
            <span className="text-xs text-blue-100">Content manager</span>
          </span>
        </Link>
        <AdminNavigation />
        <Link
          href="/"
          className="mx-4 mt-auto mb-4 hidden rounded-lg border border-white/20 px-3 py-2 text-sm text-blue-100 hover:bg-white/10 lg:block"
        >
          View website ↗
        </Link>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-rule bg-white px-4 py-2.5 sm:px-5">
          <div className="text-sm">
            <Link href="/admin" className="font-extrabold">
              Admin
            </Link>
            <span className="ml-3 text-muted">{email}</span>
          </div>
          <div className="flex gap-4 text-sm font-bold">
            <Link href="/">View website</Link>
            <form action={logout}>
              <button className="flex items-center gap-1">
                <LogOut size={15} /> Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="p-3 sm:p-5">{children}</main>
      </div>
    </div>
  );
}
