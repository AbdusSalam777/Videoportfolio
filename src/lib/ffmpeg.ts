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

/**
 * Caps how many cores ffmpeg may use. On a small shared VPS an unbounded
 * transcode saturates every core and starves whatever else is running on the
 * box, so set FFMPEG_THREADS=1 there. Unset means "use all cores".
 */
function threadArgs() {
  const threads = process.env.FFMPEG_THREADS;
  return threads ? ["-threads", threads] : [];
}

async function execFfmpeg(args: string[]) {
  try {
    await run("ffmpeg", [...threadArgs(), ...args], {
      maxBuffer: 1024 * 1024 * 50,
    });
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

/**
 * Short, muted preview clip used for grid hover-play. Kept brief (6s, no
 * audio) so it's cheap to load on hover, but encoded close to the same
 * quality as the main video (CRF 24 vs 23) rather than the much softer
 * CRF 30 this used before — that gap was visible enough that a video looked
 * noticeably worse hovering in the grid than it did a click later on its own
 * page. The short duration keeps file size small even at this quality.
 *
 * Width stays capped at 640 (roughly 2x the largest card width the grid
 * ever renders, i.e. sharp on a retina display without over-serving) rather
 * than something bigger — scaling by *width* on a portrait 9:16 source
 * balloons the height just as much, so a wider cap here disproportionately
 * bloats vertical clips for resolution nothing on the page displays.
 */
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
    "fast",
    "-crf",
    "24",
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
