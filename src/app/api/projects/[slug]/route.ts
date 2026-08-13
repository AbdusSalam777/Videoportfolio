import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { deleteProject } from "@/lib/store";
import { UPLOAD_DIR } from "@/lib/media-storage";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const project = await deleteProject(slug);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  for (const p of [project.videoPath, project.previewPath, project.posterPath]) {
    const relative = p.replace(/^\/media\//, "");
    const filePath = path.join(UPLOAD_DIR, relative);
    await fs.rm(filePath, { force: true });
  }

  return NextResponse.json({ ok: true });
}
