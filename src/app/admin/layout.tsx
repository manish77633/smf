import type { Metadata } from "next";
import localFont from "next/font/local";
import "./admin.css";
const sans = localFont({
  src: "./fonts/dm-sans.woff2",
  weight: "400 700",
  variable: "--admin-sans",
  display: "swap",
});
const serif = localFont({
  src: "./fonts/cormorant-garamond.woff2",
  weight: "400 700",
  variable: "--admin-serif",
  display: "swap",
});
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "SMF Admin", template: "%s | SMF Admin" },
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin-shell ${sans.variable} ${serif.variable}`}>
      {children}
    </div>
  );
}
