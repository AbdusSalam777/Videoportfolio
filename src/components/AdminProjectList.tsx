"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Project } from "@/lib/types";
import { categories } from "@/lib/types";
import CaptureThumbnail from "@/components/CaptureThumbnail";

function ThumbnailEditor({ project }: { project: Project }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleCapture(blob: Blob) {
    setSaving(true);
    setSaved(false);
    const fd = new FormData();
    fd.append("image", blob, "thumbnail.jpg");
    const res = await fetch(`/api/projects/${project.slug}/thumbnail`, {
      method: "POST",
      body: fd,
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setOpen(false), 1200);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-neutral-400 underline hover:text-white"
      >
        Change thumbnail
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <CaptureThumbnail videoSrc={project.videoPath} onCapture={handleCapture} />
      <div className="flex items-center gap-3 text-xs">
        {saving && <span className="text-neutral-500">Saving…</span>}
        {saved && <span className="text-green-400">Thumbnail updated ✓</span>}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-neutral-500 hover:text-neutral-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function EditProjectForm({
  project,
  onDone,
}: {
  project: Project;
  onDone: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const body = {
      title: data.get("title"),
      client: data.get("client"),
      category: data.get("category"),
      year: data.get("year"),
      summary: data.get("summary"),
      featured: data.get("featured") === "on",
    };
    const res = await fetch(`/api/projects/${project.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      setError(json?.error ?? "Failed to save");
      return;
    }
    router.refresh();
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-neutral-700 bg-neutral-950 p-4"
    >
      <div>
        <label className="mb-1 block text-sm text-neutral-400">
          Thumbnail
        </label>
        <div className="flex items-center gap-3">
          <img
            src={project.posterPath}
            alt=""
            className="h-14 w-24 rounded object-cover"
          />
          <ThumbnailEditor project={project} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-neutral-400">Title</label>
          <input
            name="title"
            defaultValue={project.title}
            required
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-400">Client</label>
          <input
            name="client"
            defaultValue={project.client}
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Category
          </label>
          <select
            name="category"
            defaultValue={project.category}
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-neutral-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-400">Year</label>
          <input
            name="year"
            type="number"
            defaultValue={project.year}
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            name="featured"
            id={`featured-${project.slug}`}
            defaultChecked={project.featured}
          />
          <label
            htmlFor={`featured-${project.slug}`}
            className="text-sm text-neutral-400"
          >
            Use as homepage hero video
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-neutral-400">Summary</label>
        <textarea
          name="summary"
          rows={3}
          defaultValue={project.summary}
          className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-neutral-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-sm text-neutral-500 hover:text-neutral-300"
        >
          Cancel
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </form>
  );
}

export default function AdminProjectList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  async function handleDelete(slug: string) {
    if (!confirm("Delete this project and its video files? This can't be undone.")) return;
    setDeleting(slug);
    await fetch(`/api/projects/${slug}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;

    const reordered = [...projects];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    setReordering(true);
    await fetch("/api/projects/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: reordered.map((p) => p.slug) }),
    });
    setReordering(false);
    router.refresh();
  }

  if (projects.length === 0) {
    return <p className="text-neutral-500">No projects uploaded yet.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">
        Use the arrows to set display order — this is the order videos appear
        in on the homepage and the Work page.
      </p>
      {projects.map((p, i) =>
        editing === p.slug ? (
          <EditProjectForm
            key={p.slug}
            project={p}
            onDone={() => setEditing(null)}
          />
        ) : (
          <div
            key={p.slug}
            className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleMove(i, -1)}
                disabled={i === 0 || reordering}
                aria-label="Move up"
                className="rounded border border-neutral-700 px-1.5 py-0.5 text-xs text-neutral-400 hover:border-white hover:text-white disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => handleMove(i, 1)}
                disabled={i === projects.length - 1 || reordering}
                aria-label="Move down"
                className="rounded border border-neutral-700 px-1.5 py-0.5 text-xs text-neutral-400 hover:border-white hover:text-white disabled:opacity-30"
              >
                ↓
              </button>
            </div>
            <img
              src={p.posterPath}
              alt={p.title}
              className="h-16 w-28 rounded object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-white">
                {p.title}{" "}
                {p.featured && (
                  <span className="text-xs text-amber-400">★ hero video</span>
                )}
              </p>
              <p className="text-sm text-neutral-500">
                {p.category} · {p.client || "—"} · {p.year}
              </p>
            </div>
            <button
              onClick={() => setEditing(p.slug)}
              className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm text-neutral-300 hover:border-white hover:text-white"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(p.slug)}
              disabled={deleting === p.slug}
              className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm text-neutral-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
            >
              {deleting === p.slug ? "Deleting…" : "Delete"}
            </button>
          </div>
        )
      )}
    </div>
  );
}
