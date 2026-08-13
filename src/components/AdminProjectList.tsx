"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Project } from "@/lib/types";

export default function AdminProjectList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(slug: string) {
    if (!confirm("Delete this project and its video files? This can't be undone.")) return;
    setDeleting(slug);
    await fetch(`/api/projects/${slug}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  if (projects.length === 0) {
    return <p className="text-neutral-500">No projects uploaded yet.</p>;
  }

  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <div
          key={p.slug}
          className="flex items-center gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-3"
        >
          <img
            src={p.posterPath}
            alt={p.title}
            className="h-16 w-28 rounded object-cover"
          />
          <div className="flex-1">
            <p className="font-medium text-white">
              {p.title} {p.featured && <span className="text-xs text-amber-400">★ featured</span>}
            </p>
            <p className="text-sm text-neutral-500">
              {p.category} · {p.client || "—"} · {p.year}
            </p>
          </div>
          <button
            onClick={() => handleDelete(p.slug)}
            disabled={deleting === p.slug}
            className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm text-neutral-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
          >
            {deleting === p.slug ? "Deleting…" : "Delete"}
          </button>
        </div>
      ))}
    </div>
  );
}
