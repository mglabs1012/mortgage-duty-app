import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Calculator as CalculatorIcon,
  Clock,
  ListChecks,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { POSTS, getFeaturedPost, type Post } from "../data/posts";
import { PostCover } from "../components/PostCover";
import { Reveal } from "../components/Reveal";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { splitMarkdownSections } from "../lib/markdown";

const SITE_URL = "https://mortgage-duty-app.vercel.app";
const ease = [0.22, 1, 0.36, 1] as const;

function PostMetaLine({ post, light = false }: { post: Post; light?: boolean }) {
  const tone = light ? "text-white/70" : "text-muted";
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${tone}`}>
      <time dateTime={post.meta.date}>{post.meta.dateLabel}</time>
      <span className="opacity-50">·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {post.meta.readingTime}
      </span>
    </div>
  );
}

function TagChip({ tag, onDark = false }: { tag: string; onDark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        onDark ? "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur" : "bg-accent-soft text-accent-ink"
      }`}
    >
      {tag}
    </span>
  );
}

export default function BlogIndex() {
  useDocumentMeta({
    title: "Blog | Rajasthan Stamp Duty Calculator",
    description:
      "Guides on Rajasthan mortgage stamp duty, registration fees, MODT, MSME concessions, and the statutory rules behind mortgage and loan deeds.",
    path: "/blog",
  });

  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const featured = getFeaturedPost();
  const topics = useMemo(
    () => (featured ? splitMarkdownSections(featured.body).map((s) => s.title) : []),
    [featured]
  );
  const tags = useMemo(() => ["All", ...Array.from(new Set(POSTS.map((p) => p.meta.tag)))], []);

  const isFiltering = query.trim() !== "" || activeTag !== "All";
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POSTS.filter((p) => {
      if (activeTag !== "All" && p.meta.tag !== activeTag) return false;
      if (!q) return true;
      return `${p.meta.title} ${p.meta.description} ${p.meta.tag}`.toLowerCase().includes(q);
    });
  }, [query, activeTag]);

  // Unfiltered view: featured hero + the rest. Filtered view: one flat grid.
  const gridPosts = isFiltering ? filtered : filtered.filter((p) => p.meta.slug !== featured?.meta.slug);

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: POSTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${p.meta.slug}`,
      name: p.meta.title,
    })),
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      {/* ---------------- Header ---------------- */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="max-w-2xl">
          <motion.nav
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { ease } } }}
            aria-label="Breadcrumb"
            className="text-xs text-muted"
          >
            <Link to="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <span className="mx-1.5 opacity-50">/</span>
            <span className="text-ink-2">Blog</span>
          </motion.nav>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
            className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
          >
            Stamp duty, <span className="text-gradient">explained.</span>
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
            className="mt-3 text-[15px] leading-relaxed text-muted sm:text-base"
          >
            Practical guides on Rajasthan mortgage stamp duty, registration fees, and the statutory
            rules behind mortgage and loan deeds.
          </motion.p>
        </div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
          className="relative w-full lg:w-80"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides…"
            aria-label="Search guides"
            className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-10 text-sm text-ink shadow-sm outline-none transition-all placeholder:text-muted focus:border-accent/60 focus:shadow-[0_0_0_4px_var(--accent-soft)] [&::-webkit-search-cancel-button]:hidden"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-surface-3 text-ink-2 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Tag filter */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.2 }}
        className="-mx-4 mt-8 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
      >
        <div role="tablist" aria-label="Filter by topic" className="flex w-max gap-1.5">
          {tags.map((t) => {
            const active = activeTag === t;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTag(t)}
                className={`relative h-9 rounded-full px-4 text-sm font-medium transition-colors ${
                  active ? "text-white" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="tag-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-ink"
                  />
                )}
                <span className={`relative ${active ? "text-canvas" : ""}`}>{t}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ---------------- Featured ---------------- */}
      <AnimatePresence initial={false}>
        {!isFiltering && featured && (
          <motion.div
            key="featured"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-5 pt-8 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease, delay: 0.1 }}
                className="lg:col-span-2"
              >
                <Link
                  to={`/blog/${featured.meta.slug}`}
                  className="card card-hover group flex h-full flex-col overflow-hidden"
                >
                  <div className="relative min-h-[14rem] flex-1 sm:min-h-[17rem]">
                    <div className="absolute inset-0">
                      <PostCover tag={featured.meta.tag} size="lg" className="h-full" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-8">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-brand-800 shadow">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </span>
                        <TagChip tag={featured.meta.tag} onDark />
                      </div>
                      <h2 className="max-w-xl font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                        {featured.meta.title}
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-col p-6 sm:p-8">
                    <PostMetaLine post={featured} />
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{featured.meta.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      Read the full guide
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>

              <motion.aside
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease, delay: 0.18 }}
                className="flex flex-col gap-5"
              >
                {topics.length > 0 && (
                  <div className="card flex-1 p-6">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-accent" />
                      <h3 className="font-display text-sm font-bold text-ink">Inside the featured guide</h3>
                    </div>
                    <ol className="mt-4 space-y-2.5">
                      {topics.slice(0, 7).map((t, i) => (
                        <li key={t} className="flex items-start gap-3 text-sm leading-snug text-ink-2">
                          <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[10px] font-bold tabular-nums text-muted">
                            {i + 1}
                          </span>
                          {t}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-700 to-brand-950 p-6 text-white shadow-[0_20px_40px_-20px_rgb(17_29_56/0.6)]">
                  <div aria-hidden className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
                  <p className="relative font-display text-lg font-extrabold">Know your exact duty</p>
                  <p className="relative mt-1 text-sm leading-relaxed text-white/70">
                    Instant Rajasthan mortgage stamp duty &amp; registration fee estimate.
                  </p>
                  <Link
                    to="/"
                    className="group relative mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-800 shadow-md transition hover:shadow-lg"
                  >
                    <CalculatorIcon className="h-4 w-4" />
                    Open calculator
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- Grid ---------------- */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">
            {isFiltering ? "Results" : "More guides"}
          </h2>
          <span className="text-sm tabular-nums text-muted">
            {gridPosts.length} {gridPosts.length === 1 ? "article" : "articles"}
          </span>
        </div>

        <motion.div
          layout
          className={`mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 ${
            gridPosts.length === 2 || gridPosts.length === 4 ? "" : "lg:grid-cols-3"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {gridPosts.map((post, i) => (
              <motion.div
                key={post.meta.slug}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, ease, delay: Math.min(i, 6) * 0.05 }}
              >
                <Link
                  to={`/blog/${post.meta.slug}`}
                  className="card card-hover group flex h-full flex-col overflow-hidden"
                >
                  <div className="relative">
                    <PostCover tag={post.meta.tag} className="h-36" />
                    <div className="absolute left-4 top-4">
                      <TagChip tag={post.meta.tag} onDark />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <PostMetaLine post={post} />
                    <h3 className="mt-2 font-display text-[17px] font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent">
                      {post.meta.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                      {post.meta.description}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-accent">
                      Read article
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {gridPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card mt-2 flex flex-col items-center gap-3 px-6 py-14 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-muted">
                <Search className="h-5 w-5" />
              </span>
              <p className="font-display text-base font-bold text-ink">No guides match that search</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveTag("All");
                }}
                className="text-sm font-semibold text-accent hover:underline"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ---------------- CTA band ---------------- */}
      <Reveal className="mt-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface px-6 py-10 text-center sm:px-12 sm:py-14">
          <div aria-hidden className="bg-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div aria-hidden className="absolute -bottom-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-brand-400/25 blur-3xl" />
          <h2 className="relative font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Ready to calculate your mortgage duty?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-[15px] text-muted">
            Enter the loan amount, pick a category, and get an instant e-GRAS-aligned estimate.
          </p>
          <Link
            to="/"
            className="group relative mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgb(31_67_133/0.9)] transition hover:brightness-110"
          >
            <CalculatorIcon className="h-4 w-4" />
            Open the calculator
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
    </div>
  );
}
