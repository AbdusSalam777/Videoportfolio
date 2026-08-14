"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Testimonial } from "@/lib/profile-types";

export default function TestimonialManager({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const res = await fetch("/api/profile/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quote: data.get("quote"),
        author: data.get("author"),
        role: data.get("role"),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      setError(json?.error ?? "Failed to add testimonial");
      return;
    }
    formRef.current?.reset();
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/profile/testimonials/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      <div>
        <h2 className="font-heading text-lg text-white">Testimonials</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Client reviews shown on your homepage. Short and specific converts
          best — what you delivered and what changed for them.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleAdd} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-neutral-400">Quote</label>
          <textarea
            name="quote"
            rows={3}
            required
            placeholder="Turned around a 12-part series in under a week and the retention on every cut beat our old editor."
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-neutral-400">
              Author
            </label>
            <input
              name="author"
              required
              placeholder="Sam Okafor"
              className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">
              Role / company
            </label>
            <input
              name="role"
              placeholder="Founder, Wild Collective"
              className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {saving ? "Adding…" : "Add testimonial"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {testimonials.length > 0 && (
        <ul className="space-y-3 border-t border-neutral-800 pt-5">
          {testimonials.map((t) => (
            <li
              key={t.id}
              className="flex items-start gap-4 rounded-lg bg-neutral-950 p-4"
            >
              <div className="flex-1">
                <p className="text-sm text-neutral-300">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-2 text-xs text-neutral-500">
                  {t.author}
                  {t.role && ` · ${t.role}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(t.id)}
                disabled={deleting === t.id}
                className="shrink-0 rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-400 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
              >
                {deleting === t.id ? "…" : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
