import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UnitProvider } from "@/components/UnitProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Space Between Worlds", template: "%s — Space Between Worlds" },
  description: "Construction and structural engineering calculators. Beams, concrete, rebar, roofing, earthwork and more, in metric or imperial.",
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <UnitProvider>
          <Nav />
          <main className="flex-1 pt-12">{children}</main>
          <Footer />
        </UnitProvider>
      </body>
    </html>
  );
}
