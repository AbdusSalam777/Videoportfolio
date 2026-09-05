import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type { Profile } from "@/lib/profile-types";
import { defaultProfile } from "@/lib/profile-types";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const PROFILE_FILE = path.join(DATA_DIR, "profile.json");

async function ensureProfileFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(PROFILE_FILE);
  } catch {
    await fs.writeFile(PROFILE_FILE, JSON.stringify(defaultProfile, null, 2), "utf-8");
  }
}

export async function readProfile(): Promise<Profile> {
  await ensureProfileFile();
  const raw = await fs.readFile(PROFILE_FILE, "utf-8");
  const saved = JSON.parse(raw);
  const profile: Profile = {
    ...defaultProfile,
    ...saved,
    // A shallow spread would let a saved layout missing newer fields (like
    // cardSize, added after some profiles were first written) fully replace
    // the default object instead of filling in just the gap.
    layout: { ...defaultProfile.layout, ...saved.layout },
  };

  // Testimonials written before approval existed were owner-authored, so treat
  // a missing flag as approved rather than silently hiding them.
  profile.testimonials = profile.testimonials.map((t) => ({
    ...t,
    approved: t.approved ?? true,
  }));

  return profile;
}

export async function writeProfile(profile: Profile) {
  await ensureProfileFile();
  await fs.writeFile(PROFILE_FILE, JSON.stringify(profile, null, 2), "utf-8");
  return profile;
}
