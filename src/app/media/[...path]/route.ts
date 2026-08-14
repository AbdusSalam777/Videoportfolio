import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/media-storage";

const CONTENT_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

/**
 * Streams uploaded videos/thumbnails from disk with HTTP Range support,
 * which browsers require to seek/scrub video playback. In production you
 * can point Nginx at UPLOAD_DIR to serve these paths directly (faster,
 * skips Node) — this route is the fallback that always works.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;
  const relative = segments.join("/");
  const filePath = path.join(UPLOAD_DIR, relative);

  // Prevent path traversal outside UPLOAD_DIR.
  if (!filePath.startsWith(path.resolve(UPLOAD_DIR))) {
    return new Response("Not found", { status: 404 });
  }

  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const range = req.headers.get("range");

  const baseHeaders: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  };

  // SVGs can carry inline <script>. Sandboxing the response keeps an uploaded
  // logo from executing anything in this site's origin.
  if (ext === ".svg") {
    baseHeaders["Content-Security-Policy"] = "sandbox; default-src 'none'";
  }

  if (!range) {
    const stream = fs.createReadStream(filePath);
    return new Response(stream as unknown as ReadableStream, {
      status: 200,
      headers: { ...baseHeaders, "Content-Length": String(stat.size) },
    });
  }

  const match = /bytes=(\d*)-(\d*)/.exec(range);
  const start = match?.[1] ? parseInt(match[1], 10) : 0;
  const end = match?.[2] ? parseInt(match[2], 10) : stat.size - 1;
  const chunkSize = end - start + 1;

  const stream = fs.createReadStream(filePath, { start, end });
  return new Response(stream as unknown as ReadableStream, {
    status: 206,
    headers: {
      ...baseHeaders,
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Content-Length": String(chunkSize),
    },
  });
}
