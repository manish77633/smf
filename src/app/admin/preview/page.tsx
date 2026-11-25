import { redirect } from "next/navigation";
import { adminEmail } from "@/auth";
import { Home } from "@/components/home";
import { getDraft } from "@/lib/site";
export default async function Preview() {
  if (!(await adminEmail())) redirect("/admin/login");
  const draft = await getDraft();
  return (
    <div className="admin-public-preview">
      <div className="bg-ink px-4 py-3 text-center text-sm font-bold text-white">
        Saved draft preview
      </div>
      <Home site={draft} preview />
    </div>
  );
}
