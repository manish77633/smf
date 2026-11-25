import {
  ArrowUp,
  ArrowUpRight,
  Building2,
  Calendar,
  Camera,
  Check,
  Clock,
  Compass,
  Gem,
  Globe,
  Heart,
  House,
  IndianRupee,
  Info,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  PanelsTopLeft,
  Phone,
  Play,
  Sparkles,
  Star,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
const icons: Record<string, LucideIcon> = {
  ArrowUp,
  ArrowUpRight,
  Building2,
  Calendar,
  Camera,
  Check,
  Clock,
  Compass,
  Gem,
  Globe,
  Heart,
  House,
  IndianRupee,
  Info,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  PanelsTopLeft,
  Phone,
  Play,
  Sparkles,
  Star,
  UsersRound,
};
const socialMarks: Record<string, string> = { Facebook: "f", LinkedIn: "in" };
export const iconNames = [
  ...Object.keys(icons),
  ...Object.keys(socialMarks),
].sort();
export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  if (Object.hasOwn(socialMarks, name))
    return (
      <span
        aria-hidden="true"
        className="font-extrabold leading-none"
        style={{ fontSize: size }}
      >
        {socialMarks[name]}
      </span>
    );
  const Glyph = Object.hasOwn(icons, name) ? icons[name] : Sparkles;
  return <Glyph size={size} aria-hidden="true" />;
}
