import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { readProfile, writeProfile } from "@/lib/profile-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const quote = String(body.quote ?? "").trim();
  const author = String(body.author ?? "").trim();
  const role = String(body.role ?? "").trim();

  if (!quote || !author) {
    return NextResponse.json(
      { error: "Quote and author are required" },
      { status: 400 }
    );
  }

  const profile = await readProfile();
  profile.testimonials.unshift({
    id: crypto.randomBytes(4).toString("hex"),
    quote,
    author,
    role,
    createdAt: new Date().toISOString(),
  });
  await writeProfile(profile);

  return NextResponse.json({ profile });
}
