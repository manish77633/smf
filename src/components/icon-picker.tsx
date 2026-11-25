"use client";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Icon, iconNames } from "./site-icons";
export default function IconPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState("");
  const id = useId();
  return (
    <div
      className="grid gap-1"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          document.getElementById(id)?.focus();
        }
      }}
    >
      <span className="text-sm font-bold">{label}</span>
      <button
        id={id}
        type="button"
        aria-label={label + ": " + (value || "Default icon")}
        aria-expanded={open}
        aria-controls={id + "-choices"}
        onClick={() => {
          setOpen(!open);
          setQuery("");
        }}
        className="field flex items-center gap-2 text-left"
      >
        <Icon name={value} size={15} />
        <span className="flex-1">{value || "Default icon"}</span>
        <ChevronDown size={14} aria-hidden />
      </button>
      {open && (
        <div
          id={id + "-choices"}
          className="rounded-lg border border-rule bg-white p-2 shadow-sm"
        >
          <input
            className="field mb-2"
            placeholder="Search icons"
            aria-label="Search icons"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="grid max-h-52 grid-cols-2 gap-1 overflow-auto sm:grid-cols-3">
            {["", ...iconNames]
              .filter((v) =>
                (v || "Default icon")
                  .toLowerCase()
                  .includes(query.toLowerCase().trim()),
              )
              .map((icon) => (
                <button
                  type="button"
                  key={icon}
                  aria-pressed={icon === value}
                  onClick={() => {
                    onChange(icon);
                    setOpen(false);
                    document.getElementById(id)?.focus();
                  }}
                  className={
                    "flex min-w-0 items-center gap-1 rounded px-1.5 py-2 text-left text-xs hover:bg-tint " +
                    (icon === value ? "bg-softblue font-bold" : "")
                  }
                >
                  <Icon size={15} name={icon} />
                  <span className="truncate">{icon || "Default"}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
