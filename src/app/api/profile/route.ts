import { NextRequest, NextResponse } from "next/server";
import { readProfile, writeProfile } from "@/lib/profile-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const current = await readProfile();

  const updated = {
    ...current,
    name: String(body.name ?? current.name).trim() || current.name,
    tagline: String(body.tagline ?? current.tagline).trim(),
    bio: String(body.bio ?? current.bio).trim(),
    clients: String(body.clients ?? current.clients).trim(),
    email: String(body.email ?? current.email).trim(),
    instagram: String(body.instagram ?? current.instagram).trim(),
    skills: String(body.skills ?? "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean),
    tools: String(body.tools ?? "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean),
  };

  await writeProfile(updated);
  return NextResponse.json({ profile: updated });
}
