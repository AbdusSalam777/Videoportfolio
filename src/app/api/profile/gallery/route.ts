import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { IMAGE_DIR, mediaUrl } from "@/lib/media-storage";
import { optimizeImage } from "@/lib/image";
import { readProfile, writeProfile } from "@/lib/profile-store";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("image");
  const caption = String(form.get("caption") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
  }

  await fs.mkdir(IMAGE_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const optimized = await optimizeImage(buffer, 2000);
  const id = crypto.randomBytes(4).toString("hex");
  const filename = `gallery-${id}.webp`;
  await fs.writeFile(path.join(IMAGE_DIR, filename), optimized);

  const profile = await readProfile();
  profile.gallery.unshift({ id, path: mediaUrl(`images/${filename}`), caption });
  await writeProfile(profile);

  return NextResponse.json({ profile });
}
