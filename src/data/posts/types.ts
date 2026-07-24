export type PostFaqItem = { q: string; a: string };

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  dateLabel: string;
  tag: string;
  readingTime: string;
};

export type Post = {
  meta: PostMeta;
  body: string; // markdown
  faq: PostFaqItem[];
};
