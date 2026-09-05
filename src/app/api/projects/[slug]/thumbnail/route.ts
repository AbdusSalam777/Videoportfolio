import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { THUMB_DIR, UPLOAD_DIR, mediaUrl } from "@/lib/media-storage";
import { optimizeImage } from "@/lib/image";
import { getProject, setProjectPoster } from "@/lib/store";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Replaces a project's thumbnail with a frame captured client-side (a canvas
 * snapshot of the video at whatever timestamp the admin picked), rather than
 * ffmpeg's automatic first-second grab.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const project = await getProject(slug);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const form = await req.formData();
  const file = form.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}` },
      { status: 400 }
    );
  }

  await fs.mkdir(THUMB_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const optimized = await optimizeImage(buffer, 1280);
  const filename = `${slug}-${crypto.randomBytes(4).toString("hex")}.webp`;
  await fs.writeFile(path.join(THUMB_DIR, filename), optimized);

  const oldPosterPath = project.posterPath;
  const updated = await setProjectPoster(slug, mediaUrl(`thumbs/${filename}`));

  if (oldPosterPath) {
    const relative = oldPosterPath.replace(/^\/media\//, "");
    await fs.rm(path.join(UPLOAD_DIR, relative), { force: true }).catch(() => {});
  }

  return NextResponse.json({ project: updated });
}
