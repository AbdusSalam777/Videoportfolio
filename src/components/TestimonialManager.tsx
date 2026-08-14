"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Testimonial } from "@/lib/profile-types";

function Row({
  t,
  busy,
  onApprove,
  onDelete,
}: {
  t: Testimonial;
  busy: boolean;
  onApprove: (id: string, approved: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="rounded-lg bg-neutral-950 p-4">
      <p className="text-sm text-neutral-300">&ldquo;{t.quote}&rdquo;</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-neutral-500">
          {t.author}
          {t.role && ` · ${t.role}`}
          <span className="ml-2 text-neutral-700">
            {new Date(t.createdAt).toLocaleDateString()}
          </span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(t.id, !t.approved)}
            disabled={busy}
            className={`rounded-full px-3 py-1 text-xs disabled:opacity-50 ${
              t.approved
                ? "border border-neutral-700 text-neutral-400 hover:border-neutral-500"
                : "bg-white font-medium text-black"
            }`}
          >
            {t.approved ? "Unpublish" : "Approve"}
          </button>
          <button
            onClick={() => onDelete(t.id)}
            disabled={busy}
            className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-400 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

export default function TestimonialManager({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const pending = testimonials.filter((t) => !t.approved);
  const published = testimonials.filter((t) => t.approved);

  async function setApproved(id: string, approved: boolean) {
    setBusy(id);
    await fetch(`/api/profile/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    setBusy(id);
    await fetch(`/api/profile/testimonials/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  return (
    <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      <div>
        <h2 className="font-heading text-lg text-white">
          Reviews
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-medium text-black">
              {pending.length} pending
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Clients submit these from your homepage. Nothing appears on the site
          until you approve it.
        </p>
      </div>

      {pending.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-amber-400">
            Awaiting your approval
          </h3>
          <ul className="space-y-3">
            {pending.map((t) => (
              <Row
                key={t.id}
                t={t}
                busy={busy === t.id}
                onApprove={setApproved}
                onDelete={remove}
              />
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-medium text-neutral-400">
          Published ({published.length})
        </h3>
        {published.length === 0 ? (
          <p className="text-sm text-neutral-600">
            Nothing published yet. Approved reviews show on your homepage.
          </p>
        ) : (
          <ul className="space-y-3">
            {published.map((t) => (
              <Row
                key={t.id}
                t={t}
                busy={busy === t.id}
                onApprove={setApproved}
                onDelete={remove}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
