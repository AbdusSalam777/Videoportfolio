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
  const company = profile.companies.find((c) => c.id === id);

  if (!company) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  profile.companies = profile.companies.filter((c) => c.id !== id);
  await writeProfile(profile);

  if (company.logoPath) {
    const relative = company.logoPath.replace(/^\/media\//, "");
    await fs.rm(path.join(UPLOAD_DIR, relative), { force: true });
  }

  return NextResponse.json({ profile });
}
