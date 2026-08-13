import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 px-6 py-10 md:px-12">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="font-heading text-lg text-white">YOUR NAME</p>
          <p className="mt-1 text-sm text-neutral-400">
            Video editor for creators & brands.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-neutral-400">
          <Link href="/contact" className="hover:text-white">
            Book a call
          </Link>
          <a href="mailto:you@example.com" className="hover:text-white">
            you@example.com
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            Instagram
          </a>
        </div>
      </div>
      <p className="mt-8 text-xs text-neutral-600">
        © {new Date().getFullYear()} Your Name. All rights reserved.
      </p>
    </footer>
  );
}
