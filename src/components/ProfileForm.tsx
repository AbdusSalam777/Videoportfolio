"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/profile-types";
import { initialsAvatar } from "@/lib/avatar";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Always render four rows so empty slots can be filled in later.
  const stats = [0, 1, 2, 3].map(
    (i) => profile.stats[i] ?? { value: "", label: "" }
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const body = {
      name: data.get("name"),
      tagline: data.get("tagline"),
      bio: data.get("bio"),
      clients: data.get("clients"),
      email: data.get("email"),
      instagram: data.get("instagram"),
      skills: data.get("skills"),
      tools: data.get("tools"),
      stats: data
        .getAll("statValue")
        .map((value, i) => ({ value, label: data.getAll("statLabel")[i] })),
    };
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Failed to save");
      return;
    }
    router.refresh();
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    await fetch("/api/profile/avatar", { method: "POST", body: fd });
    router.refresh();
  }

  return (
    <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      <div>
        <h2 className="font-heading text-lg text-white">Profile</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Your name, story, and headline stats — shown across the whole site.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <img
          src={profile.avatarPath || initialsAvatar(profile.name)}
          alt="Avatar"
          className="h-16 w-16 rounded-full object-cover"
        />
        <div>
          <label className="cursor-pointer text-sm text-neutral-300 underline">
            Change photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatar}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-neutral-400">Name</label>
            <input
              name="name"
              defaultValue={profile.name}
              className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">Email</label>
            <input
              name="email"
              defaultValue={profile.email}
              className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Hero tagline
          </label>
          <input
            name="tagline"
            defaultValue={profile.tagline}
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            About / bio
          </label>
          <textarea
            name="bio"
            rows={5}
            defaultValue={profile.bio}
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-neutral-400">
              Skills (comma separated)
            </label>
            <input
              name="skills"
              defaultValue={profile.skills.join(", ")}
              placeholder="Color grading, Sound design, Motion graphics"
              className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">
              Tools (comma separated)
            </label>
            <input
              name="tools"
              defaultValue={profile.tools.join(", ")}
              placeholder="Premiere Pro, DaVinci Resolve, After Effects"
              className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Instagram URL
          </label>
          <input
            name="instagram"
            defaultValue={profile.instagram}
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Headline stats
          </label>
          <p className="mb-2 text-xs text-neutral-500">
            Four numbers shown across your homepage. Leave a pair blank to hide
            it.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {stats.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  name="statValue"
                  defaultValue={s.value}
                  placeholder="48hr"
                  className="w-24 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
                />
                <input
                  name="statLabel"
                  defaultValue={s.label}
                  placeholder="Typical turnaround"
                  className="flex-1 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-500"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </section>
  );
}
