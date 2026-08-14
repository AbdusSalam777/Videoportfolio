"use client";

import { useState } from "react";

export default function ReviewForm() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const data = new FormData(e.currentTarget);
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quote: data.get("quote"),
        author: data.get("author"),
        role: data.get("role"),
        website: data.get("website"), // honeypot
      }),
    });

    if (res.ok) {
      setStatus("sent");
      return;
    }

    const json = await res.json().catch(() => null);
    setError(json?.error ?? "Something went wrong. Please try again.");
    setStatus("idle");
  }

  if (status === "sent") {
    return (
      <div className="mt-10 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 text-center">
        <p className="text-neutral-200">Thanks — your review has been sent.</p>
        <p className="mt-1 text-sm text-neutral-500">
          It&apos;ll appear here once it&apos;s been read and published.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-10 text-center">
        <button
          onClick={() => setOpen(true)}
          className="rounded-full border border-neutral-700 px-6 py-2.5 text-sm text-neutral-200 transition-colors hover:border-white hover:text-white"
        >
          Worked with me? Leave a review
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 max-w-xl rounded-xl border border-neutral-800 bg-neutral-900/60 p-6"
    >
      <h3 className="font-heading text-lg text-white">Leave a review</h3>
      <p className="mt-1 text-sm text-neutral-500">
        Reviews are published after I&apos;ve read them.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Your review
          </label>
          <textarea
            name="quote"
            rows={4}
            required
            maxLength={600}
            placeholder="What was it like working together, and what did you get out of it?"
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-neutral-400">
              Your name
            </label>
            <input
              name="author"
              required
              maxLength={80}
              className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">
              Role / company{" "}
              <span className="text-neutral-600">(optional)</span>
            </label>
            <input
              name="role"
              maxLength={100}
              placeholder="Founder, Acme"
              className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
            />
          </div>
        </div>

        {/* Honeypot — hidden from people, filled in by bots. */}
        <div aria-hidden="true" className="absolute left-[-9999px]">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Submit review"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm text-neutral-500 hover:text-neutral-300"
          >
            Cancel
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </form>
  );
}
