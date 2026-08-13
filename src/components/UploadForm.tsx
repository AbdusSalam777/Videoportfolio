"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/types";

export default function UploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("uploading");
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Upload failed");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("idle");
      router.refresh();
    } catch {
      setError("Upload failed — check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900 p-6"
    >
      <h2 className="font-heading text-lg text-white">Upload a project</h2>

      <div>
        <label className="mb-1 block text-sm text-neutral-400">
          Video file
        </label>
        <input
          type="file"
          name="video"
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
          required
          className="w-full text-sm text-neutral-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Uploaded as-is, then compressed to a web-ready MP4 on the server.
          Large files may take a few minutes to process.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-neutral-400">Title</label>
          <input
            name="title"
            required
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-400">Client</label>
          <input
            name="client"
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Category
          </label>
          <select
            name="category"
            required
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-400">Role</label>
          <input
            name="role"
            placeholder="Edit, Color, Sound"
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-400">Year</label>
          <input
            name="year"
            type="number"
            defaultValue={new Date().getFullYear()}
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" name="featured" id="featured" />
          <label htmlFor="featured" className="text-sm text-neutral-400">
            Feature on homepage
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-neutral-400">Summary</label>
        <textarea
          name="summary"
          rows={3}
          className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
        />
      </div>

      <button
        type="submit"
        disabled={status === "uploading"}
        className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
      >
        {status === "uploading" ? "Uploading & processing…" : "Upload"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
