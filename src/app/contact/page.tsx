import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Your Name",
};

export default function ContactPage() {
  return (
    <div className="px-6 pt-32 pb-20 md:px-12">
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-3xl text-white md:text-4xl">
          Let&apos;s work together
        </h1>
        <p className="mt-3 text-neutral-400">
          Tell me a bit about your project — timeline, footage you have, and
          what you need edited.
        </p>
        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
