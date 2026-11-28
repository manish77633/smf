import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowUpRight, LogOut } from "lucide-react";
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
    <div className="admin-workspace min-h-screen lg:grid lg:grid-cols-[224px_minmax(0,1fr)]">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <Image src="/images/smf.svg" alt="SMF" width={64} height={32} />
          <strong className="admin-brand-title">Content Studio</strong>
        </Link>
        <AdminNavigation />
        <form className="admin-sidebar-footer" action={logout}>
          <button className="admin-quiet-action"><LogOut size={15} aria-hidden /> Sign out</button>
        </form>
      </aside>
      <div className="min-w-0">
        <header className="admin-topbar">
          <Link href="/admin/account" className="min-w-0 truncate text-muted">{email}</Link>
          <Link href="/" target="_blank" className="admin-quiet-action">
            View website <ArrowUpRight size={15} aria-hidden />
          </Link>
        </header>
        <main className="p-4 sm:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
