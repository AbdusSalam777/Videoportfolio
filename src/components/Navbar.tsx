import Link from "next/link";
import { readProfile } from "@/lib/profile-store";

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default async function Navbar() {
  const profile = await readProfile();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-12">
      <Link
        href="/"
        className="font-heading text-lg tracking-wide text-white"
      >
        {profile.name.toUpperCase()}
      </Link>
      <nav className="flex items-center gap-6">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-sm text-neutral-300 transition-colors hover:text-white"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
