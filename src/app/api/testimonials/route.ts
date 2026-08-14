import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { readProfile, writeProfile } from "@/lib/profile-store";

export const runtime = "nodejs";

const MAX_QUOTE = 600;
const MAX_NAME = 80;
const MAX_ROLE = 100;
const MAX_PENDING = 50;

// Simple in-memory rate limit: a submitter gets 3 posts per hour. Resets when
// the server restarts, which is fine — this only needs to blunt casual spam.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

/**
 * Public endpoint — anyone can submit a review, but it is stored unapproved
 * and stays invisible on the site until the owner approves it in /admin.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real people leave this hidden field empty; bots fill everything.
  if (String(body.website ?? "").trim() !== "") {
    // Pretend it worked so the bot doesn't retry with a different shape.
    return NextResponse.json({ ok: true });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Try again later." },
      { status: 429 }
    );
  }

  const quote = String(body.quote ?? "").trim();
  const author = String(body.author ?? "").trim();
  const role = String(body.role ?? "").trim();

  if (quote.length < 10) {
    return NextResponse.json(
      { error: "Please write at least a sentence." },
      { status: 400 }
    );
  }
  if (!author) {
    return NextResponse.json({ error: "Your name is required." }, { status: 400 });
  }
  if (quote.length > MAX_QUOTE || author.length > MAX_NAME || role.length > MAX_ROLE) {
    return NextResponse.json({ error: "Submission is too long." }, { status: 400 });
  }

  const profile = await readProfile();

  // Cap the pending queue so a flood can't grow the data file without bound.
  const pendingCount = profile.testimonials.filter((t) => !t.approved).length;
  if (pendingCount >= MAX_PENDING) {
    return NextResponse.json(
      { error: "We're not accepting reviews right now. Please email instead." },
      { status: 429 }
    );
  }

  profile.testimonials.unshift({
    id: crypto.randomBytes(4).toString("hex"),
    quote,
    author,
    role,
    createdAt: new Date().toISOString(),
    approved: false,
  });
  await writeProfile(profile);

  return NextResponse.json({ ok: true });
}
