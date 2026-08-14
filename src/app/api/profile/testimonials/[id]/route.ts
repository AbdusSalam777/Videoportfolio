import { NextRequest, NextResponse } from "next/server";
import { readProfile, writeProfile } from "@/lib/profile-store";

export const runtime = "nodejs";

/** Approve or unpublish a client-submitted review. */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const approved = Boolean(body?.approved);

  const profile = await readProfile();
  const testimonial = profile.testimonials.find((t) => t.id === id);

  if (!testimonial) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  testimonial.approved = approved;
  await writeProfile(profile);

  return NextResponse.json({ profile });
}

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
