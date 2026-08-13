"use client";

import { useState } from "react";
import HoverVideoCard from "@/components/HoverVideoCard";
import { categories, type Category, type Project } from "@/lib/types";

export default function WorkGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Category | "All">("All");

  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2">
        <button
          onClick={() => setActive("All")}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            active === "All"
              ? "bg-white text-black"
              : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              active === c
                ? "bg-white text-black"
                : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-neutral-500">No projects in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <HoverVideoCard key={p.slug} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
