import { NextRequest, NextResponse } from "next/server";
import { readProfile, writeProfile } from "@/lib/profile-store";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const profile = await readProfile();

  if (!profile.testimonials.some((t) => t.id === id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  profile.testimonials = profile.testimonials.filter((t) => t.id !== id);
  await writeProfile(profile);

  return NextResponse.json({ profile });
}
