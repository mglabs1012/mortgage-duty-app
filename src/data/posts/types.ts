export type PostFaqItem = { q: string; a: string };

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  dateLabel: string;
  tag: string;
  readingTime: string;
  /** Pins this post as the blog's featured/cornerstone article, regardless of date order. */
  featured?: boolean;
};

export type Post = {
  meta: PostMeta;
  body: string; // markdown
  faq: PostFaqItem[];
};
