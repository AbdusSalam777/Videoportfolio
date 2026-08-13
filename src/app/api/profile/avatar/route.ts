import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { UPLOAD_DIR, IMAGE_DIR, mediaUrl } from "@/lib/media-storage";
import { optimizeImage } from "@/lib/image";
import { readProfile, writeProfile } from "@/lib/profile-store";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
  }

  await fs.mkdir(IMAGE_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const optimized = await optimizeImage(buffer, 800);
  const filename = `avatar-${crypto.randomBytes(4).toString("hex")}.webp`;
  const filePath = path.join(IMAGE_DIR, filename);
  await fs.writeFile(filePath, optimized);

  const profile = await readProfile();
  const oldAvatar = profile.avatarPath;
  profile.avatarPath = mediaUrl(`images/${filename}`);
  await writeProfile(profile);

  if (oldAvatar) {
    const oldRelative = oldAvatar.replace(/^\/media\//, "");
    await fs.rm(path.join(UPLOAD_DIR, oldRelative), { force: true }).catch(() => {});
  }

  return NextResponse.json({ profile });
}
