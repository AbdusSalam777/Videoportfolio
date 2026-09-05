import { NextRequest, NextResponse } from "next/server";
import { reorderProjects } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const slugs = body?.slugs;

  if (!Array.isArray(slugs) || !slugs.every((s) => typeof s === "string")) {
    return NextResponse.json(
      { error: "Expected { slugs: string[] }" },
      { status: 400 }
    );
  }

  const projects = await reorderProjects(slugs);
  return NextResponse.json({ projects });
}
