"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/types";
import CaptureThumbnail from "@/components/CaptureThumbnail";

export default function UploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "processing" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [customThumb, setCustomThumb] = useState<Blob | null>(null);

  // Revoke the local preview URL whenever it changes or the form unmounts,
  // so selecting several files in a row doesn't leak blob: URLs.
  useEffect(() => {
    return () => {
      if (previewSrc) URL.revokeObjectURL(previewSrc);
    };
  }, [previewSrc]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (previewSrc) URL.revokeObjectURL(previewSrc);
    setCustomThumb(null);
    setPreviewSrc(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setProgress(0);

    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get("video");

    if (!(file instanceof File) || file.size === 0) {
      setError("Choose a video file first.");
      setStatus("error");
      return;
    }

    // Metadata goes in the query string so the request body is only the file —
    // see the comment in src/app/api/upload/route.ts for why.
    const params = new URLSearchParams({
      title: String(data.get("title") ?? ""),
      client: String(data.get("client") ?? ""),
      category: String(data.get("category") ?? ""),
      year: String(data.get("year") ?? ""),
      summary: String(data.get("summary") ?? ""),
      featured: data.get("featured") ? "true" : "false",
      filename: file.name,
    });

    // XHR rather than fetch: it reports upload progress, which matters when a
    // multi-GB file would otherwise sit there with no feedback for minutes.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/upload?${params.toString()}`);
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

    xhr.upload.onprogress = (ev) => {
      if (!ev.lengthComputable) return;
      const pct = Math.round((ev.loaded / ev.total) * 100);
      setProgress(pct);
      // Once bytes are all sent, the server is transcoding.
      setStatus(pct >= 100 ? "processing" : "uploading");
    };

    xhr.onload = async () => {
      let json: { project?: { slug: string }; error?: string } | null = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON error page */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        // If a custom frame was captured, apply it after the main upload
        // finishes — the transcoded video (and its slug) has to exist first.
        if (customThumb && json?.project?.slug) {
          const fd = new FormData();
          fd.append("image", customThumb, "thumbnail.jpg");
          await fetch(`/api/projects/${json.project.slug}/thumbnail`, {
            method: "POST",
            body: fd,
          }).catch(() => {});
        }
        if (previewSrc) URL.revokeObjectURL(previewSrc);
        form.reset();
        setPreviewSrc(null);
        setCustomThumb(null);
        setStatus("idle");
        setProgress(0);
        router.refresh();
      } else {
        setError(json?.error ?? `Upload failed (${xhr.status})`);
        setStatus("error");
      }
    };

    xhr.onerror = () => {
      setError("Upload failed — check your connection and try again.");
      setStatus("error");
    };

    setStatus("uploading");
    xhr.send(file);
  }

  const busy = status === "uploading" || status === "processing";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950 p-5"
    >
      <div>
        <label className="mb-1 block text-sm text-neutral-400">
          Video file
        </label>
        <input
          type="file"
          name="video"
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
          required
          onChange={handleFileChange}
          className="w-full text-sm text-neutral-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Uploaded as-is, then compressed to a web-ready MP4 on the server.
          Large files may take a few minutes to process.
        </p>
      </div>

      {previewSrc && (
        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Thumbnail{" "}
            <span className="text-neutral-600">
              (optional — scrub to a frame and capture it, otherwise one is
              picked automatically)
            </span>
          </label>
          <CaptureThumbnail videoSrc={previewSrc} onCapture={setCustomThumb} />
        </div>
      )}

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
            Use as homepage hero video
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
        disabled={busy}
        className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
      >
        {status === "uploading"
          ? `Uploading… ${progress}%`
          : status === "processing"
            ? "Processing video…"
            : "Upload"}
      </button>

      {busy && (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-white transition-all duration-200"
              style={{ width: status === "processing" ? "100%" : `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            {status === "processing"
              ? "Compressing and generating the thumbnail on the server. Large files can take several minutes — keep this tab open."
              : "Sending file to the server…"}
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
