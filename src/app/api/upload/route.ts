import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { TMP_DIR, VIDEO_DIR, THUMB_DIR, mediaUrl } from "@/lib/media-storage";
import {
  transcodeMain,
  transcodePreview,
  extractThumbnail,
  probeDimensions,
  FfmpegMissingError,
} from "@/lib/ffmpeg";
import { addProject, readProjects, slugify, type Category } from "@/lib/store";
import { hasValidSession } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 3600; // hour-long ceiling; big transcodes are slow

const ALLOWED_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
]);
const ALLOWED_EXTS = new Set([".mp4", ".mov", ".webm", ".mkv"]);
const MAX_BYTES = 5 * 1024 * 1024 * 1024; // 5GB

/**
 * Streams a Web ReadableStream (the request body) to disk, reading it
 * manually via getReader() instead of Readable.fromWeb().
 *
 * Readable.fromWeb() runs its own internal read loop outside the promise we
 * await, so when the underlying connection drops mid-upload (a client
 * hiccup, or nginx giving up on a stalled transfer) it can throw "Invalid
 * state: ReadableStream is already closed" from *outside* any try/catch in
 * this file — surfacing as an uncaughtException that crashed the entire
 * server process for every visitor, not just the failed upload. Reading the
 * stream manually keeps every read inside a try/catch this function owns, so
 * a dropped connection becomes a normal caught error and an HTTP response,
 * never a process crash.
 */
async function streamToFile(
  body: ReadableStream<Uint8Array>,
  destPath: string,
  maxBytes: number
) {
  const reader = body.getReader();
  const dest = createWriteStream(destPath);
  let written = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      written += value.byteLength;
      if (written > maxBytes) {
        throw new Error("File too large");
      }

      if (!dest.write(value)) {
        await new Promise<void>((resolve, reject) => {
          dest.once("drain", resolve);
          dest.once("error", reject);
        });
      }
    }

    await new Promise<void>((resolve, reject) => {
      dest.end((err?: Error | null) => (err ? reject(err) : resolve()));
    });
  } catch (err) {
    dest.destroy();
    // Cancelling releases the reader's lock; without this the underlying
    // stream can be left in the half-read state that produces the crash
    // this function exists to avoid.
    await reader.cancel().catch(() => {});
    throw err;
  }

  return written;
}

async function ensureDirs() {
  await fs.mkdir(TMP_DIR, { recursive: true });
  await fs.mkdir(VIDEO_DIR, { recursive: true });
  await fs.mkdir(THUMB_DIR, { recursive: true });
}

/**
 * Receives the video as the raw request body and streams it straight to disk.
 *
 * Deliberately NOT multipart/form-data: Next's `req.formData()` buffers the
 * whole body in memory and fails outright on large uploads ("Failed to parse
 * body as FormData"). Metadata rides along in the query string instead, so the
 * body is nothing but the file and memory use stays flat regardless of size.
 */
export async function POST(req: NextRequest) {
  // Authenticated here rather than in proxy.ts: see the note in that file.
  if (!hasValidSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams;
  const title = (q.get("title") ?? "").trim();
  const client = (q.get("client") ?? "").trim();
  const category = (q.get("category") ?? "").trim() as Category;
  const year = Number(q.get("year")) || new Date().getFullYear();
  const summary = (q.get("summary") ?? "").trim();
  const featured = q.get("featured") === "true";
  const filename = (q.get("filename") ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!req.body) {
    return NextResponse.json({ error: "No video file provided" }, { status: 400 });
  }

  const contentType = (req.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext = path.extname(filename).toLowerCase();

  // Browsers occasionally send a blank or generic type; fall back to extension.
  const typeOk = ALLOWED_TYPES.has(contentType);
  const extOk = ALLOWED_EXTS.has(ext);
  if (!typeOk && !extOk) {
    return NextResponse.json(
      { error: `Unsupported file type: ${contentType || ext || "unknown"}` },
      { status: 400 }
    );
  }

  const declaredSize = Number(req.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  await ensureDirs();

  const existing = await readProjects();
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let n = 2;
  while (existing.some((p) => p.slug === slug)) {
    slug = `${baseSlug}-${n++}`;
  }

  const hash = crypto.randomBytes(4).toString("hex");
  const originalPath = path.join(TMP_DIR, `${slug}-${hash}${ext || ".mp4"}`);
  const mainFile = `${slug}-${hash}.mp4`;
  const previewFile = `${slug}-${hash}-preview.mp4`;
  const thumbFile = `${slug}-${hash}.jpg`;
  const mainPath = path.join(VIDEO_DIR, mainFile);
  const previewPath = path.join(VIDEO_DIR, previewFile);
  const thumbPath = path.join(THUMB_DIR, thumbFile);

  const cleanup = async () => {
    await Promise.all(
      [originalPath, mainPath, previewPath, thumbPath].map((p) =>
        fs.rm(p, { force: true }).catch(() => {})
      )
    );
  };

  // Stream the upload to disk without buffering it in memory.
  try {
    await streamToFile(req.body, originalPath, MAX_BYTES);
  } catch (err) {
    await cleanup();
    const tooLarge = err instanceof Error && err.message === "File too large";
    return NextResponse.json(
      { error: tooLarge ? "File too large" : "Upload failed or was interrupted" },
      { status: tooLarge ? 413 : 400 }
    );
  }

  const stat = await fs.stat(originalPath).catch(() => null);
  if (!stat || stat.size === 0) {
    await cleanup();
    return NextResponse.json({ error: "Uploaded file was empty" }, { status: 400 });
  }

  console.log(
    `[upload] ${slug}: declared=${declaredSize} received=${stat.size} diff=${declaredSize - stat.size}`
  );

  // A short read means the transfer was cut off. Encoding it anyway would
  // silently publish a truncated video, so fail loudly instead.
  if (declaredSize > 0 && stat.size < declaredSize) {
    await cleanup();
    return NextResponse.json(
      {
        error: `Upload incomplete — received ${stat.size} of ${declaredSize} bytes. Please try again.`,
      },
      { status: 400 }
    );
  }

  let dimensions: { width: number; height: number } | null = null;

  try {
    await transcodeMain(originalPath, mainPath);
    await transcodePreview(originalPath, previewPath);
    await extractThumbnail(originalPath, thumbPath);
    dimensions = await probeDimensions(mainPath);
  } catch (err) {
    await cleanup();
    if (err instanceof FfmpegMissingError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    console.error("ffmpeg transcode failed", err);
    return NextResponse.json(
      { error: "Video processing failed — the file may be corrupt or use an unsupported codec." },
      { status: 500 }
    );
  } finally {
    await fs.rm(originalPath, { force: true }).catch(() => {});
  }

  const project = await addProject({
    slug,
    title,
    client,
    category,
    year,
    summary,
    featured,
    createdAt: new Date().toISOString(),
    videoPath: mediaUrl(`videos/${mainFile}`),
    previewPath: mediaUrl(`videos/${previewFile}`),
    posterPath: mediaUrl(`thumbs/${thumbFile}`),
    ...(dimensions ?? {}),
  });

  return NextResponse.json({ project });
}
