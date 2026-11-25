"use client";
import { useTransition } from "react";
import { toast } from "sonner";
export function Submit({
  children,
  confirmText,
  danger = false,
}: {
  children: React.ReactNode;
  confirmText?: string;
  danger?: boolean;
}) {
  return (
    <button
      className={
        danger
          ? "rounded border border-rule bg-white px-3 py-2 text-sm font-bold text-brand"
          : "button min-h-0 py-2"
      }
      onClick={(e) => {
        if (confirmText && !confirm(confirmText)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
export function Copy({ value }: { value: string }) {
  return (
    <button
      type="button"
      className="text-sm font-bold underline"
      onClick={() =>
        navigator.clipboard
          .writeText(value)
          .then(() => toast.success("URL copied"))
          .catch(() => toast.error("Could not copy URL"))
      }
    >
      Copy URL
    </button>
  );
}
export function ActionForm({
  action,
  children,
  className,
  message = "Changes saved",
}: {
  action: (data: FormData) => Promise<void>;
  children: React.ReactNode;
  className?: string;
  message?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <form
      className={className}
      action={(data) =>
        start(async () => {
          try {
            await action(data);
            toast.success(message);
          } catch (e) {
            if (
              e instanceof Error &&
              "digest" in e &&
              String(e.digest).startsWith("NEXT_REDIRECT")
            )
              throw e;
            toast.error("Could not complete the action.");
          }
        })
      }
    >
      <fieldset className="contents" disabled={pending}>
        {children}
      </fieldset>
      {pending && (
        <p role="status" className="text-xs text-muted">
          Saving…
        </p>
      )}
    </form>
  );
}
