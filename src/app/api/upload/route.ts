import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { TMP_DIR, VIDEO_DIR, THUMB_DIR, mediaUrl } from "@/lib/media-storage";
import { transcodeMain, transcodePreview, extractThumbnail, FfmpegMissingError } from "@/lib/ffmpeg";
import { addProject, readProjects, slugify, type Category } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 300; // large video transcodes can take a while

const ALLOWED_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
]);
const MAX_BYTES = 3 * 1024 * 1024 * 1024; // 3GB — raise if your VPS/Nginx allow more

async function ensureDirs() {
  await fs.mkdir(TMP_DIR, { recursive: true });
  await fs.mkdir(VIDEO_DIR, { recursive: true });
  await fs.mkdir(THUMB_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("video");
  const title = String(form.get("title") ?? "").trim();
  const client = String(form.get("client") ?? "").trim();
  const category = String(form.get("category") ?? "").trim() as Category;
  const role = String(form.get("role") ?? "").trim();
  const year = Number(form.get("year") ?? new Date().getFullYear());
  const summary = String(form.get("summary") ?? "").trim();
  const featured = form.get("featured") === "on" || form.get("featured") === "true";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No video file provided" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || "unknown"}` },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
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
  const ext = path.extname(file.name) || ".mp4";
  const originalPath = path.join(TMP_DIR, `${slug}-${hash}${ext}`);
  const mainFile = `${slug}-${hash}.mp4`;
  const previewFile = `${slug}-${hash}-preview.mp4`;
  const thumbFile = `${slug}-${hash}.jpg`;
  const mainPath = path.join(VIDEO_DIR, mainFile);
  const previewPath = path.join(VIDEO_DIR, previewFile);
  const thumbPath = path.join(THUMB_DIR, thumbFile);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(originalPath, buffer);

  try {
    await transcodeMain(originalPath, mainPath);
    await transcodePreview(originalPath, previewPath);
    await extractThumbnail(originalPath, thumbPath);
  } catch (err) {
    await fs.rm(originalPath, { force: true });
    await fs.rm(mainPath, { force: true });
    await fs.rm(previewPath, { force: true });
    await fs.rm(thumbPath, { force: true });
    if (err instanceof FfmpegMissingError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    console.error("ffmpeg transcode failed", err);
    return NextResponse.json({ error: "Video processing failed" }, { status: 500 });
  } finally {
    await fs.rm(originalPath, { force: true });
  }

  const project = await addProject({
    slug,
    title,
    client,
    category,
    role,
    year,
    summary,
    featured,
    createdAt: new Date().toISOString(),
    videoPath: mediaUrl(`videos/${mainFile}`),
    previewPath: mediaUrl(`videos/${previewFile}`),
    posterPath: mediaUrl(`thumbs/${thumbFile}`),
  });

  return NextResponse.json({ project });
}
