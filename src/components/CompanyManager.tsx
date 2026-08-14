"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Company } from "@/lib/profile-types";

export default function CompanyManager({ companies }: { companies: Company[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/profile/companies", {
      method: "POST",
      body: new FormData(e.currentTarget),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      setError(json?.error ?? "Failed to add company");
      return;
    }
    formRef.current?.reset();
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/profile/companies/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      <div>
        <h2 className="font-heading text-lg text-white">Worked with</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Brands and creators you&apos;ve edited for. A logo looks best, but the
          name alone still works — it renders as a clean wordmark.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleAdd} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-neutral-400">
              Company / creator name
            </label>
            <input
              name="name"
              required
              placeholder="Wild Collective"
              className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">
              Website (optional)
            </label>
            <input
              name="url"
              placeholder="https://example.com"
              className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Logo (optional — PNG, SVG, or WebP)
          </label>
          <input
            type="file"
            name="logo"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="w-full text-sm text-neutral-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {saving ? "Adding…" : "Add company"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {companies.length > 0 && (
        <ul className="flex flex-wrap gap-2 border-t border-neutral-800 pt-5">
          {companies.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-2 rounded-full bg-neutral-950 py-1.5 pl-3 pr-1.5"
            >
              {c.logoPath && (
                <img
                  src={c.logoPath}
                  alt=""
                  className="h-5 w-5 rounded object-contain"
                />
              )}
              <span className="text-sm text-neutral-300">{c.name}</span>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deleting === c.id}
                className="rounded-full px-2 text-xs text-neutral-500 hover:text-red-400 disabled:opacity-50"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
