export type GalleryImage = {
  id: string;
  path: string;
  caption: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  /** e.g. "Founder, Wild Collective" or "YouTube creator, 280K subs" */
  role: string;
  createdAt: string;
};

export type Company = {
  id: string;
  name: string;
  /** Optional uploaded logo; falls back to a styled wordmark when empty. */
  logoPath: string;
  url: string;
};

export type Profile = {
  name: string;
  tagline: string;
  bio: string;
  skills: string[];
  tools: string[];
  clients: string;
  email: string;
  instagram: string;
  avatarPath: string;
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  companies: Company[];
  /** Headline stats shown on the homepage, e.g. "6" / "years editing". */
  stats: { label: string; value: string }[];
};

export const defaultProfile: Profile = {
  name: "Your Name",
  tagline: "I edit fast-paced video for creators & brands.",
  bio: "I'm a video editor focused on retention-driven content — commercials, music videos, and short-form cutdowns for creators and small brands. Go to /admin to replace this with your real story: how you got into editing, the projects you're proudest of, and what makes your cuts different from anyone else's.",
  skills: ["Pacing & story", "Color grading", "Sound design", "Motion graphics"],
  tools: ["Premiere Pro", "DaVinci Resolve", "After Effects"],
  clients: "",
  email: "you@example.com",
  instagram: "",
  avatarPath: "",
  gallery: [],
  testimonials: [],
  companies: [],
  stats: [
    { value: "6+", label: "Years editing" },
    { value: "120+", label: "Projects delivered" },
    { value: "48hr", label: "Typical turnaround" },
    { value: "2", label: "Revision rounds included" },
  ],
};
