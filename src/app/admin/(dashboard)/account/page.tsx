import { changePassword } from "../../actions";
export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold">Account Settings</h1>
      <form action={changePassword} className="panel grid max-w-xl gap-4 p-6">
        <h2 className="text-lg font-bold">Change password</h2>
        {error && (
          <p role="alert" className="text-sm text-brand">
            {error === "current"
              ? "Check your current password."
              : "Use matching passwords with at least 14 characters and no more than 72 bytes."}
          </p>
        )}
        {[
          ["current", "Current password"],
          ["next", "New password"],
          ["confirm", "Confirm new password"],
        ].map(([name, label]) => (
          <label className="grid gap-2 text-sm font-bold" key={name}>
            {label}
            <input
              className="field"
              required
              type="password"
              autoComplete={
                name === "current" ? "current-password" : "new-password"
              }
              name={name}
            />
          </label>
        ))}
        <button className="button justify-self-start">Change password</button>
      </form>
    </div>
  );
}
