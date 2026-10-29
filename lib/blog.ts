import posts from "./blog.generated.json";

/** One compiled post. Built by scripts/blog.mjs from content/blog/*.md. */
export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string;
  pillar: string;
  keyword: string;
  words: number;
  minutes: number;
  faq: { q: string; a: string }[];
  html: string;
  text: string;
};

/** Newest first. */
export const allPosts = posts as Post[];
