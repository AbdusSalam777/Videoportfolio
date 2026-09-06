export type Category =
  | "Commercial"
  | "Real Estate"
  | "Music Video"
  | "Social / Vertical"
  | "YouTube"
  | "Wedding"
  | "Motion Graphics";

export type Project = {
  slug: string;
  title: string;
  client: string;
  category: Category;
  year: number;
  summary: string;
  featured: boolean;
  createdAt: string;
  /** Paths are served by /media/[...path] — see src/app/media/[...path]/route.ts */
  videoPath: string;
  previewPath: string;
  posterPath: string;
  /** Source pixel dimensions; absent on uploads made before this was tracked. */
  width?: number;
  height?: number;
  /**
   * Manual display position, lowest first. New uploads get placed before
   * everything else; drag the list in /admin to change it. Older records
   * saved before this existed have no order — readProjects() falls back to
   * createdAt for those so nothing goes missing.
   */
  order?: number;
};

export const categories: Category[] = [
  "Commercial",
  "Real Estate",
  "Music Video",
  "Social / Vertical",
  "YouTube",
  "Wedding",
  "Motion Graphics",
];
