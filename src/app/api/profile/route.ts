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
    stats: Array.isArray(body.stats)
      ? body.stats
          .map((s: { value?: unknown; label?: unknown }) => ({
            value: String(s?.value ?? "").trim(),
            label: String(s?.label ?? "").trim(),
          }))
          .filter((s: { value: string; label: string }) => s.value && s.label)
      : current.stats,
    layout: {
      verticalPerRow: (([1, 2, 3, 4].includes(Number(body.layout?.verticalPerRow))
        ? Number(body.layout.verticalPerRow)
        : current.layout.verticalPerRow) as 1 | 2 | 3 | 4),
      horizontalPerRow: (([1, 2, 3].includes(Number(body.layout?.horizontalPerRow))
        ? Number(body.layout.horizontalPerRow)
        : current.layout.horizontalPerRow) as 1 | 2 | 3),
      cardSize: ((["sm", "md", "lg"].includes(body.layout?.cardSize)
        ? body.layout.cardSize
        : current.layout.cardSize) as "sm" | "md" | "lg"),
    },
  };

  await writeProfile(updated);
  return NextResponse.json({ profile: updated });
}
