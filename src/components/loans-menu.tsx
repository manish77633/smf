"use client";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Icon } from "./site-icons";
type Loan = { slug: string; title: string; icon: string };
export function LoansMenu({
  name,
  href,
  loans,
  mobile = false,
}: {
  name: string;
  href: string;
  loans: Loan[];
  mobile?: boolean;
}) {
  const [open, setOpen] = useState(false),
    control = useRef<HTMLButtonElement>(null),
    id = useId();
  const pathname = usePathname(),
    active =
      pathname === href || loans.some((loan) => pathname === "/" + loan.slug);
  return (
    <div
      className={mobile ? "relative" : "relative flex items-center"}
      onPointerEnter={(e) => {
        if (!mobile && e.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (
          !mobile &&
          e.pointerType === "mouse" &&
          !e.currentTarget.contains(document.activeElement)
        )
          setOpen(false);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          control.current?.focus();
        }
      }}
    >
      <div className="flex items-center gap-1">
        <Link
          href={href}
          className={
            "font-bold hover:text-brand " + (active ? "text-brand" : "")
          }
        >
          {name}
        </Link>
        <button
          ref={control}
          data-menu-toggle
          type="button"
          aria-label="Toggle loan services"
          aria-expanded={open}
          aria-controls={id}
          className="grid size-8 place-items-center rounded-md hover:bg-tint hover:text-brand"
          onClick={() => setOpen(!open)}
        >
          <ChevronDown
            size={14}
            aria-hidden
            className={open ? "rotate-180" : ""}
          />
        </button>
      </div>
      {open && (
        <div
          id={id}
          className={
            mobile
              ? "mt-2"
              : "absolute top-full left-1/2 z-40 w-[min(500px,84vw)] -translate-x-1/2 pt-2"
          }
        >
          <div className="rounded-xl border border-rule bg-white p-3 shadow-[0_16px_35px_#06265324]">
            <ul className={"grid gap-1 " + (!mobile ? "grid-cols-2" : "")}>
              {loans.map((l) => (
                <li key={l.slug}>
                  <Link
                    onClick={() => setOpen(false)}
                    href={"/" + l.slug}
                    className="flex min-h-11 items-center gap-2 rounded-lg px-2 py-1.5 font-bold transition-colors hover:bg-softblue hover:text-brand"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-softblue text-navy">
                      <Icon name={l.icon} size={15} />
                    </span>
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={href}
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-between rounded-md border-t border-rule px-2 pt-3 pb-1 font-bold text-brand hover:underline"
            >
              <span>View all services</span>
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
