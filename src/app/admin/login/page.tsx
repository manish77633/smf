import Link from "next/link";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { adminEmail, signIn } from "@/auth";
import PasswordField from "./password-field";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await adminEmail()) redirect("/admin");
  const { error } = await searchParams;
  const configured = Boolean(
    process.env.AUTH_SECRET && process.env.MONGODB_URI,
  );
  return (
    <main className="grid min-h-dvh place-items-center bg-tint p-5">
      <div className="panel w-full max-w-md p-8 shadow-sm">
        <p className="eyebrow">Shree Mahavir Fincorp</p>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Admin sign in
        </h1>
        {!configured && (
          <p className="mt-5 rounded-lg bg-tint p-3 text-sm text-muted">
            Configure MongoDB and Auth.js to sign in.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-5 text-sm text-brand">
            Sign-in failed. Check your credentials or try again later.
          </p>
        )}
        <form
          className="mt-6 grid gap-4"
          action={async (data) => {
            "use server";
            try {
              await signIn("credentials", {
                email: data.get("email"),
                password: data.get("password"),
                redirectTo: "/admin",
              });
            } catch (error) {
              if (error instanceof AuthError) redirect("/admin/login?error=1");
              throw error;
            }
          }}
        >
          <label className="grid gap-1 text-sm font-bold">
            Email
            <input
              name="email"
              autoComplete="username"
              type="email"
              required
              className="field"
            />
          </label>
          <PasswordField />
          <button className="button disabled:opacity-50" disabled={!configured}>
            Sign in
          </button>
        </form>
        <Link
          href="/"
          className="mt-5 inline-block text-sm text-muted underline"
        >
          Return to website
        </Link>
      </div>
    </main>
  );
}
