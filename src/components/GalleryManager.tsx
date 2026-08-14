"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GalleryImage } from "@/lib/profile-types";

export default function GalleryManager({ images }: { images: GalleryImage[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/profile/gallery", { method: "POST", body: fd });
    formRef.current?.reset();
    setUploading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/profile/gallery/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      <div>
        <h2 className="font-heading text-lg text-white">
          Behind-the-scenes gallery
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Editing screenshots, workspace photos, before/after stills — shown on
          your About page and homepage.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleUpload}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-sm text-neutral-400">Image</label>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            required
            className="w-full text-sm text-neutral-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm text-neutral-400">
            Caption (optional)
          </label>
          <input
            name="caption"
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Add"}
        </button>
      </form>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative">
              <img
                src={img.path}
                alt={img.caption}
                className="aspect-square w-full rounded-md object-cover"
              />
              <button
                onClick={() => handleDelete(img.id)}
                disabled={deleting === img.id}
                className="absolute right-1.5 top-1.5 rounded-full bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
              >
                {deleting === img.id ? "…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
