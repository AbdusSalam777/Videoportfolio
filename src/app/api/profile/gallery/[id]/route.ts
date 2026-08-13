import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/media-storage";
import { readProfile, writeProfile } from "@/lib/profile-store";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const profile = await readProfile();
  const image = profile.gallery.find((g) => g.id === id);
  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  profile.gallery = profile.gallery.filter((g) => g.id !== id);
  await writeProfile(profile);

  const relative = image.path.replace(/^\/media\//, "");
  await fs.rm(path.join(UPLOAD_DIR, relative), { force: true });

  return NextResponse.json({ profile });
}
