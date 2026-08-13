"use client";

import { useState } from "react";

const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!FORM_ENDPOINT) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-neutral-200">
        Thanks — got your message. I&apos;ll reply within a day.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-neutral-400">Name</label>
        <input
          name="name"
          required
          className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-white outline-none focus:border-neutral-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-neutral-400">Email</label>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-white outline-none focus:border-neutral-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-neutral-400">
          Project details
        </label>
        <textarea
          name="message"
          rows={5}
          required
          className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-white outline-none focus:border-neutral-500"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.03] disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-400">
          {FORM_ENDPOINT
            ? "Something went wrong — try again or email directly."
            : "Contact form isn't configured yet — set NEXT_PUBLIC_FORM_ENDPOINT in .env.local (e.g. a Formspree endpoint)."}
        </p>
      )}
    </form>
  );
}
