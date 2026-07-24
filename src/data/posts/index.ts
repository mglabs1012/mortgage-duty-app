import type { Post } from "./types";
import { post as rajasthanMortgageStampDutyCalculator2026 } from "./rajasthan-mortgage-stamp-duty-calculator-2026";

export const POSTS: Post[] = [rajasthanMortgageStampDutyCalculator2026].sort(
  (a, b) => b.meta.date.localeCompare(a.meta.date)
);

export function getPostBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.meta.slug === slug);
}

export type { Post, PostMeta, PostFaqItem } from "./types";
