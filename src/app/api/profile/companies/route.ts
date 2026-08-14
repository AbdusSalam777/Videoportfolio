import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { IMAGE_DIR, mediaUrl } from "@/lib/media-storage";
import { optimizeImage } from "@/lib/image";
import { readProfile, writeProfile } from "@/lib/profile-store";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const url = String(form.get("url") ?? "").trim();
  const file = form.get("logo");

  if (!name) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  let logoPath = "";

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported logo type: ${file.type}` },
        { status: 400 }
      );
    }
    await fs.mkdir(IMAGE_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());

    // SVGs are already tiny and vector — store as-is rather than rasterizing.
    if (file.type === "image/svg+xml") {
      const filename = `logo-${crypto.randomBytes(4).toString("hex")}.svg`;
      await fs.writeFile(path.join(IMAGE_DIR, filename), buffer);
      logoPath = mediaUrl(`images/${filename}`);
    } else {
      const optimized = await optimizeImage(buffer, 400);
      const filename = `logo-${crypto.randomBytes(4).toString("hex")}.webp`;
      await fs.writeFile(path.join(IMAGE_DIR, filename), optimized);
      logoPath = mediaUrl(`images/${filename}`);
    }
  }

  const profile = await readProfile();
  profile.companies.push({
    id: crypto.randomBytes(4).toString("hex"),
    name,
    logoPath,
    url,
  });
  await writeProfile(profile);

  return NextResponse.json({ profile });
}
