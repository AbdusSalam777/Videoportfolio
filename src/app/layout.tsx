import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { readProfile } from "@/lib/profile-store";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// Dynamic (not a static `metadata` export) so the browser tab always shows
// the name set in /admin — a plain object literal here can't read it, which
// is exactly why every page used to show the literal placeholder "Your Name".
export async function generateMetadata(): Promise<Metadata> {
  const profile = await readProfile();
  return {
    title: {
      default: `${profile.name} — Video Editor`,
      // Child pages just set title: "Work" etc. and this appends the name.
      template: `%s — ${profile.name}`,
    },
    description:
      profile.tagline ||
      "Video editing portfolio — commercials, music videos, social cutdowns, and YouTube content.",
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#0a0a0a] text-neutral-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
