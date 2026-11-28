import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";
import { publicLanguage } from "@/lib/public-language";
const jakarta = localFont({
  src: "./jakarta.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--public-font",
});
const display = localFont({
  src: "./admin/fonts/cormorant-garamond.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--public-display",
});
export const metadata: Metadata = { icons: ["/images/smf.svg"] };
export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={await publicLanguage()}>
      <body
        className={`${jakarta.className} ${jakarta.variable} ${display.variable}`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
