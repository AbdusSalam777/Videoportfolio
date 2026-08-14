import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

export class FfmpegMissingError extends Error {
  constructor() {
    super(
      "ffmpeg was not found on this server. Install it with: sudo apt install ffmpeg"
    );
    this.name = "FfmpegMissingError";
  }
}

async function execFfmpeg(args: string[]) {
  try {
    await run("ffmpeg", args, { maxBuffer: 1024 * 1024 * 50 });
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") throw new FfmpegMissingError();
    throw err;
  }
}

/**
 * Transcodes any uploaded video into a compressed, web-ready H.264 MP4.
 * -movflags +faststart moves metadata to the front of the file so playback
 * can start before the whole file downloads — this is the single biggest
 * lever for perceived load speed on a self-hosted video.
 */
export async function transcodeMain(input: string, output: string) {
  await execFfmpeg([
    "-y",
    "-i",
    input,
    "-vf",
    "scale='min(1920,iw)':-2",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    output,
  ]);
}

/** Short, small, muted preview clip used for grid hover-play. */
export async function transcodePreview(input: string, output: string) {
  await execFfmpeg([
    "-y",
    "-i",
    input,
    "-t",
    "6",
    "-vf",
    "scale='min(640,iw)':-2",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "30",
    "-movflags",
    "+faststart",
    output,
  ]);
}

/**
 * Reads the video's pixel dimensions so the UI can lay out vertical (9:16)
 * clips differently from landscape ones instead of cropping them to fit.
 */
export async function probeDimensions(input: string) {
  try {
    const { stdout } = await run(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-of",
        "csv=p=0",
        input,
      ],
      { maxBuffer: 1024 * 1024 }
    );
    const [w, h] = stdout.trim().split(",").map(Number);
    if (!w || !h) return null;
    return { width: w, height: h };
  } catch {
    return null; // non-fatal: layout just falls back to landscape
  }
}

export async function extractThumbnail(input: string, output: string) {
  await execFfmpeg([
    "-y",
    "-ss",
    "1",
    "-i",
    input,
    "-frames:v",
    "1",
    "-vf",
    "scale='min(1280,iw)':-2",
    output,
  ]);
}
