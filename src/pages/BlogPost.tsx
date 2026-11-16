import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Calculator as CalculatorIcon,
  Check,
  ChevronDown,
  Clock,
  Copy,
  FileText,
  HelpCircle,
  ListTree,
  Share2,
} from "lucide-react";
import { POSTS, getPostBySlug } from "../data/posts";
import { MarkdownArticle } from "../components/MarkdownArticle";
import { FaqAccordion } from "../components/FaqAccordion";
import { TableOfContents } from "../components/TableOfContents";
import { PostCover } from "../components/PostCover";
import { Reveal } from "../components/Reveal";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { splitMarkdownSections } from "../lib/markdown";

const SITE_URL = "https://mortgage-duty-app.vercel.app";
const ease = [0.22, 1, 0.36, 1] as const;

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  useDocumentMeta({
    title: post ? `${post.meta.title} | Rajasthan Stamp Duty Calculator` : "Post not found",
    description: post?.meta.description ?? "This article could not be found.",
    path: post ? `/blog/${post.meta.slug}` : "/blog",
    type: post ? "article" : "website",
  });

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 300, damping: 40, restDelta: 0.001 });

  const sections = useMemo(() => (post ? splitMarkdownSections(post.body) : []), [post]);
  const tocItems = useMemo(
    () =>
      post
        ? [
            ...sections.map((s) => ({ id: slugify(s.title), title: s.title })),
            { id: "faqs", title: "Frequently asked questions" },
          ]
        : [],
    [post, sections]
  );
  const relatedPosts = useMemo(
    () => (post ? POSTS.filter((p) => p.meta.slug !== post.meta.slug).slice(0, 3) : []),
    [post]
  );

  const [copied, setCopied] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${SITE_URL}/blog/${post?.meta.slug ?? ""}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleShare = async () => {
    const url = `${SITE_URL}/blog/${post?.meta.slug ?? ""}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: post?.meta.title, url });
        return;
      }
      await handleCopyLink();
    } catch {
      /* user cancelled */
    }
  };

  if (!post) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <motion.div
          initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-lg"
        >
          <FileText className="h-7 w-7" />
        </motion.div>
        <p className="font-display text-2xl font-extrabold text-ink">Article not found</p>
        <p className="text-sm text-muted">
          This guide may have moved or doesn&apos;t exist. Head back to the blog to see what&apos;s
          available.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.meta.title,
    description: post.meta.description,
    datePublished: post.meta.date,
    dateModified: post.meta.date,
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: "MG Labs" },
    publisher: { "@type": "Organization", name: "Rajasthan Stamp Duty Calculator" },
    mainEntityOfPage: `${SITE_URL}/blog/${post.meta.slug}`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.meta.title, item: `${SITE_URL}/blog/${post.meta.slug}` },
    ],
  };

  const shareButtons = (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={handleCopyLink}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-2"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? "c" : "n"}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            className="flex items-center gap-2"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy link"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </motion.button>
    </>
  );

  return (
    <div className="w-full">
      {/* Reading progress */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="no-print fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-brand-400 via-sky-400 to-emerald-400"
      />

      {/* ---------------- Header ---------------- */}
      <header className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          className="max-w-3xl"
        >
          <motion.nav
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted"
          >
            <Link to="/blog" className="group inline-flex items-center gap-1 font-semibold text-ink-2 hover:text-ink">
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Blog
            </Link>
            <span className="opacity-50">/</span>
            <span>{post.meta.tag}</span>
          </motion.nav>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
            className="mt-5 font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-4xl lg:text-5xl"
          >
            {post.meta.title}
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
            className="mt-4 text-base leading-relaxed text-muted sm:text-lg"
          >
            {post.meta.description}
          </motion.p>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
            className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted"
          >
            <span className="inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-[10px] font-bold text-white">
                MG
              </span>
              <span className="font-semibold text-ink-2">MG Labs</span>
            </span>
            <span className="opacity-40">·</span>
            <time dateTime={post.meta.date}>{post.meta.dateLabel}</time>
            <span className="opacity-40">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.meta.readingTime}
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
          className="no-print mt-8"
        >
          <PostCover tag={post.meta.tag} size="lg" className="h-24 rounded-3xl sm:h-44" />
        </motion.div>
      </header>

      {/* Mobile: share + collapsible contents */}
      <div className="no-print mx-auto mt-5 flex w-full max-w-6xl flex-col gap-3 px-4 sm:px-6 lg:hidden">
        <div className="flex gap-2">{shareButtons}</div>
        <div className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileTocOpen((o) => !o)}
            aria-expanded={mobileTocOpen}
            className="flex w-full items-center justify-between gap-2 px-4 py-3"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ListTree className="h-4 w-4 text-accent" /> On this page
            </span>
            <motion.span animate={{ rotate: mobileTocOpen ? 180 : 0 }} className="flex text-muted">
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>
          <div className="collapsible" data-open={mobileTocOpen}>
            <div>
              <ol className="space-y-1 border-t border-line px-4 py-3">
                {tocItems.map((t, i) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      onClick={() => setMobileTocOpen(false)}
                      className="flex gap-3 rounded-lg py-1.5 text-sm text-ink-2 hover:text-ink"
                    >
                      <span className="w-5 shrink-0 text-right text-xs font-semibold tabular-nums text-muted">
                        {i + 1}
                      </span>
                      {t.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Body ---------------- */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10 lg:px-8 lg:pt-10">
        <article className="flex min-w-0 flex-col gap-6">
          <div className="card px-5 py-7 sm:px-9 sm:py-10 lg:px-12">
            {sections.map((section, i) => (
              <Reveal
                key={section.title}
                id={slugify(section.title)}
                y={14}
                className={`scroll-mt-28 ${i === 0 ? "" : "mt-12 border-t border-line pt-12"}`}
              >
                <h2 className="flex items-start gap-3 font-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                  <span className="mt-1 flex h-7 min-w-7 items-center justify-center rounded-lg bg-accent-soft px-1.5 text-xs font-bold tabular-nums text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{section.title}</span>
                </h2>
                <MarkdownArticle markdown={section.content} />
              </Reveal>
            ))}
          </div>

          {/* FAQ */}
          <Reveal id="faqs" className="scroll-mt-28">
            <section aria-labelledby="post-faq-heading" className="card p-5 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <HelpCircle className="h-4 w-4" />
                </span>
                <h2 id="post-faq-heading" className="font-display text-xl font-extrabold tracking-tight text-ink">
                  Frequently asked questions
                </h2>
              </div>
              <FaqAccordion items={post.faq} />
            </section>
          </Reveal>

          {/* CTA */}
          <Reveal className="no-print">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-700 to-brand-950 px-6 py-9 text-center text-white shadow-[0_24px_48px_-24px_rgb(17_29_56/0.7)] sm:px-10">
              <div aria-hidden className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
              <div aria-hidden className="absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-sky-400/25 blur-3xl" />
              <p className="relative font-display text-xl font-extrabold sm:text-2xl">
                Not sure how much mortgage duty is payable?
              </p>
              <p className="relative mx-auto mt-2 max-w-md text-sm text-white/75">
                Enter the loan amount, select the category, and get an instant Rajasthan mortgage
                stamp duty and registration fee estimate.
              </p>
              <Link
                to="/"
                className="group relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-800 shadow-lg transition hover:shadow-xl"
              >
                <CalculatorIcon className="h-4 w-4" />
                Calculate your mortgage duty
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        </article>

        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.25 }}
          className="no-print hidden flex-col gap-4 lg:sticky lg:top-24 lg:flex lg:self-start"
        >
          <TableOfContents items={tocItems} watchKey={post.meta.slug} />
          <div className="card flex gap-2 p-3">{shareButtons}</div>
          <Link
            to="/"
            className="card card-hover group flex items-center gap-3 p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow">
              <CalculatorIcon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">Calculate your duty</span>
              <span className="block text-xs text-muted">Free instant estimate</span>
            </span>
            <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" />
          </Link>
        </motion.aside>
      </div>

      {/* ---------------- Related ---------------- */}
      {relatedPosts.length > 0 && (
        <section className="no-print mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">Keep reading</h2>
            <Link to="/blog" className="group inline-flex items-center gap-1 text-sm font-semibold text-accent">
              All guides
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {relatedPosts.map((related, i) => (
              <Reveal key={related.meta.slug} delay={i * 0.08} className="h-full">
                <Link
                  to={`/blog/${related.meta.slug}`}
                  className="card card-hover group flex h-full flex-col overflow-hidden"
                >
                  <PostCover tag={related.meta.tag} size="sm" className="h-24" />
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                      {related.meta.tag}
                    </span>
                    <p className="mt-1.5 font-display text-[15px] font-bold leading-snug text-ink transition-colors group-hover:text-accent">
                      {related.meta.title}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs text-muted">
                      <Clock className="h-3 w-3" /> {related.meta.readingTime}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
