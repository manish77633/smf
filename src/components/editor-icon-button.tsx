import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

type Props = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "className"
> & {
  icon: LucideIcon;
  label: string;
  tooltip?: string;
  tone?: "danger";
  hiddenState?: boolean;
};

export default function EditorIconButton({
  icon: Icon,
  label,
  tooltip,
  tone,
  hiddenState,
  ...button
}: Props) {
  return (
    <button
      {...button}
      type="button"
      className="admin-icon-button"
      aria-label={label}
      title={tooltip || label}
      data-tone={tone}
      data-state={hiddenState ? "hidden" : undefined}
    >
      <Icon size={14} strokeWidth={1.9} aria-hidden="true" />
    </button>
  );
}
