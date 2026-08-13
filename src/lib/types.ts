export type Category =
  | "Commercial"
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
  role: string;
  year: number;
  summary: string;
  featured: boolean;
  createdAt: string;
  /** Paths are served by /media/[...path] — see src/app/media/[...path]/route.ts */
  videoPath: string;
  previewPath: string;
  posterPath: string;
};

export const categories: Category[] = [
  "Commercial",
  "Music Video",
  "Social / Vertical",
  "YouTube",
  "Wedding",
  "Motion Graphics",
];
