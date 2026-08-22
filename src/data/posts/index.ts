import type { Post } from "./types";
import { post as rajasthanMortgageStampDutyCalculator2026 } from "./rajasthan-mortgage-stamp-duty-calculator-2026";
import { post as msmeStampDutyConcessionRajasthan } from "./msme-stamp-duty-concession-rajasthan";
import { post as payStampDutyOnlineEgrasRajasthan } from "./pay-stamp-duty-online-egras-rajasthan";
import { post as documentsRequiredMortgageRegistrationRajasthan } from "./documents-required-mortgage-registration-rajasthan";

export const POSTS: Post[] = [
  rajasthanMortgageStampDutyCalculator2026,
  msmeStampDutyConcessionRajasthan,
  payStampDutyOnlineEgrasRajasthan,
  documentsRequiredMortgageRegistrationRajasthan,
].sort((a, b) => b.meta.date.localeCompare(a.meta.date));

export function getPostBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.meta.slug === slug);
}

export function getFeaturedPost(): Post | undefined {
  return POSTS.find((p) => p.meta.featured) ?? POSTS[0];
}

export type { Post, PostMeta, PostFaqItem } from "./types";
