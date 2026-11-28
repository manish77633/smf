"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField() {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="grid gap-1 text-sm font-bold">
      <label htmlFor="admin-login-password">Password</label>
      <div className="relative">
        <input
          id="admin-login-password"
          name="password"
          autoComplete="current-password"
          type={visible ? "text" : "password"}
          required
          className="field pr-12 [&::-ms-reveal]:hidden"
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-controls="admin-login-password"
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-muted hover:text-navy focus-visible:outline-2 focus-visible:-outline-offset-2"
          onClick={() => setVisible((current) => !current)}
        >
          <Icon size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
