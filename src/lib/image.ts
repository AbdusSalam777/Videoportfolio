import "server-only";
import sharp from "sharp";

/** Compresses and resizes an uploaded image to keep page loads fast. */
export async function optimizeImage(buffer: Buffer, maxWidth = 2000) {
  return sharp(buffer)
    .rotate() // respect EXIF orientation
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}
