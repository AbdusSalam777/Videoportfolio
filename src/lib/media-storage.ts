import path from "node:path";

// Where actual video/image files live on disk. On the VPS, point this
// outside the git checkout (e.g. /var/www/vidportfolio-uploads) via
// UPLOAD_DIR so uploads survive deploys and can optionally be served
// directly by Nginx for best performance. Defaults to ./uploads locally.
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

export const TMP_DIR = path.join(UPLOAD_DIR, "tmp");
export const VIDEO_DIR = path.join(UPLOAD_DIR, "videos");
export const THUMB_DIR = path.join(UPLOAD_DIR, "thumbs");

/** Public URL (served by src/app/media/[...path]/route.ts) for a stored file. */
export function mediaUrl(relativePath: string) {
  return `/media/${relativePath}`;
}
