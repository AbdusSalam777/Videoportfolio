"use client";

import { useEffect, useState } from "react";
import HoverVideoCard from "@/components/HoverVideoCard";
import { splitByOrientation } from "@/lib/orientation";
import type { Project } from "@/lib/types";
import type { WorkLayout } from "@/lib/profile-types";

const GAP_REM = 1.25; // matches gap-5
const VERTICAL_MAX_PX = 340;
const HORIZONTAL_MAX_PX = 640;
const DESKTOP_BREAKPOINT_PX = 640; // Tailwind's `sm`

function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 1) return items.map((i) => [i]);
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

/**
 * A percentage flex-basis can't force an exact column count on its own: once
 * each card is capped by max-width, the browser just packs however many fit
 * per row rather than respecting the configured count. So rows are built by
 * literally slicing the array into groups of `perRow` first — each group is
 * its own flex row, which makes the count exact by construction and centres
 * a shorter final group for free (fewer items in a `justify-center` row).
 *
 * Below the `sm` breakpoint every row is forced to one item regardless of
 * the configured count — a desktop "3 per row" setting would otherwise
 * squeeze cards to a third of a phone screen. That check needs the actual
 * viewport, so this component reads window width on mount; the very first
 * server-rendered paint uses one column everywhere, then widens once
 * measured, rather than risk 3-across on a phone if JS is slow to run.
 */
function Row({
  items,
  perRow,
  maxPx,
}: {
  items: Project[];
  perRow: number;
  maxPx: number;
}) {
  const basis =
    perRow <= 1
      ? "100%"
      : `calc((100% - ${(perRow - 1) * GAP_REM}rem) / ${perRow})`;

  return (
    <div className="flex flex-wrap justify-center gap-5">
      {items.map((p) => (
        <div
          key={p.slug}
          className="flex-none"
          style={{ flexBasis: basis, maxWidth: `${maxPx}px`, width: "100%" }}
        >
          <HoverVideoCard project={p} />
        </div>
      ))}
    </div>
  );
}

export default function WorkGrid({
  projects,
  layout = { verticalPerRow: 3, horizontalPerRow: 2 },
}: {
  projects: Project[];
  layout?: WorkLayout;
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT_PX);
    check();
    // Both listeners are registered because some environments (notably
    // devtools-style viewport emulation) resize the window without firing a
    // matchMedia "change" event, or vice versa — together they cover both.
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`);
    mq.addEventListener("change", check);
    window.addEventListener("resize", check);
    return () => {
      mq.removeEventListener("change", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const { vertical, horizontal } = splitByOrientation(projects);
  const verticalPerRow = isDesktop ? layout.verticalPerRow : 1;
  const horizontalPerRow = isDesktop ? layout.horizontalPerRow : 1;

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-800 px-6 py-16 text-center">
        <p className="text-neutral-400">No projects published yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {chunk(vertical, verticalPerRow).map((row, i) => (
        <Row
          key={`v-${i}`}
          items={row}
          perRow={verticalPerRow}
          maxPx={VERTICAL_MAX_PX}
        />
      ))}
      {chunk(horizontal, horizontalPerRow).map((row, i) => (
        <Row
          key={`h-${i}`}
          items={row}
          perRow={horizontalPerRow}
          maxPx={HORIZONTAL_MAX_PX}
        />
      ))}
    </div>
  );
}
