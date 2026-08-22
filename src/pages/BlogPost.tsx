import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useScroll, useSpring } from "motion/react";
import {
  ArrowLeft,
  Calculator as CalculatorIcon,
  FileText,
  List,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { getPostBySlug } from "../data/posts";
import { MarkdownArticle } from "../components/MarkdownArticle";
import { FaqAccordion } from "../components/FaqAccordion";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { splitMarkdownSections } from "../lib/markdown";

const SITE_URL = "https://mortgage-duty-app.vercel.app";

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

  const sections = post ? splitMarkdownSections(post.body) : [];
  const tocItems = post
    ? [
        ...sections.map((s) => ({ id: slugify(s.title), title: s.title })),
        { id: "faqs", title: "Frequently Asked Questions" },
      ]
    : [];

  const [activeId, setActiveId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!post) return;
    const ids = tocItems.map((t) => t.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-110px 0px -70% 0px", threshold: [0, 1] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.meta.slug, tocItems.length]);

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
      <div className="font-inter relative flex min-h-screen w-full flex-col items-center justify-center gap-4 overflow-hidden bg-slate-50 px-4 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-300/25 blur-3xl"
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-600/25">
          <FileText className="h-7 w-7" />
        </div>
        <p className="font-poppins relative text-xl font-extrabold text-slate-900">
          Article not found
        </p>
        <p className="relative max-w-xs font-inter text-sm text-slate-500">
          This guide may have moved or doesn&apos;t exist. Head back to the blog to
          see what&apos;s available.
        </p>
        <Link
          to="/blog"
          className="relative inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2.5 font-inter text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700 active:scale-95"
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

  return (
    <div className="font-inter min-h-screen w-full bg-slate-50">
      {/* Reading progress bar */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="no-print fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-800 to-slate-900 px-4 pb-8 pt-6 sm:px-6 sm:pb-10 lg:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl"
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
          <Link
            to="/blog"
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-inter text-xs font-semibold text-white/90 backdrop-blur transition hover:bg-white/20 active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to blog
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="flex max-w-3xl flex-col gap-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-2.5 py-1 font-inter text-[11px] font-bold text-white backdrop-blur">
                {post.meta.tag}
              </span>
              <time dateTime={post.meta.date} className="font-inter text-xs text-white/70">
                {post.meta.dateLabel}
              </time>
              <span className="font-inter text-xs text-white/40">·</span>
              <span className="font-inter text-xs text-white/70">{post.meta.readingTime}</span>
            </div>
            <h1 className="font-poppins text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
              {post.meta.title}
            </h1>
            <p className="max-w-xl font-inter text-sm leading-relaxed text-white/70">
              {post.meta.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mobile-only share row (desktop uses the sticky sidebar) */}
      <div className="no-print mx-auto flex w-full max-w-6xl gap-2 px-4 pt-4 sm:px-6 lg:hidden">
        <button
          onClick={handleCopyLink}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 font-inter text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/70 transition active:scale-95"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-50 py-2.5 font-inter text-xs font-bold text-indigo-700 shadow-sm ring-1 ring-indigo-100 transition active:scale-95"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
      </div>

      {/* Content: article + sticky TOC sidebar */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 pb-14 pt-6 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-10 lg:pt-10">
        {/* Article */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="min-w-0 flex flex-col gap-5"
        >
          <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200/70 sm:p-8 lg:p-10">
            {sections.map((section, i) => (
              <div
                key={section.title}
                id={slugify(section.title)}
                className={`scroll-mt-24 ${i === 0 ? "" : "mt-8 border-t border-slate-100 pt-8"}`}
              >
                <h2 className="font-poppins text-xl font-extrabold text-slate-900 sm:text-2xl">
                  {section.title}
                </h2>
                <MarkdownArticle markdown={section.content} />
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div
            id="faqs"
            aria-labelledby="post-faq-heading"
            className="scroll-mt-24 rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-200/70 sm:p-7"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <h2 id="post-faq-heading" className="font-poppins text-base font-bold text-slate-800">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mt-2">
              <FaqAccordion items={post.faq} />
            </div>
          </div>

          {/* CTA */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-5 py-6 text-center shadow-xl">
            <p className="font-poppins text-lg font-extrabold text-white">
              Not sure how much mortgage duty is payable?
            </p>
            <p className="mx-auto mt-1.5 max-w-sm font-inter text-sm text-white/70">
              Enter the loan amount, select the category, and get an instant
              Rajasthan mortgage stamp duty and registration fee estimate.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 font-inter text-sm font-bold text-indigo-700 shadow-md transition hover:bg-indigo-50 active:scale-95"
            >
              <CalculatorIcon className="h-4 w-4" />
              Calculate Your Mortgage Duty Now
            </Link>
          </div>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        </motion.article>

        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 30, delay: 0.08 }}
          className="no-print hidden flex-col gap-4 lg:sticky lg:top-6 lg:flex lg:self-start"
        >
          <nav
            aria-label="Table of contents"
            className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200/70"
          >
            <div className="flex items-center gap-2 px-1">
              <List className="h-4 w-4 text-indigo-600" />
              <p className="font-inter text-[11px] font-bold uppercase tracking-wide text-slate-400">
                In this article
              </p>
            </div>
            <ul className="mt-2 max-h-[50vh] space-y-0.5 overflow-y-auto border-l-2 border-slate-100 pl-0.5">
              {tocItems.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`-ml-0.5 block border-l-2 py-1.5 pl-3 font-inter text-xs leading-snug transition ${
                        isActive
                          ? "border-indigo-600 font-bold text-indigo-700"
                          : "border-transparent font-medium text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {item.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex gap-2 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-slate-200/70">
            <button
              onClick={handleCopyLink}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 font-inter text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-50 py-2.5 font-inter text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 active:scale-95"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>

          <div className="hidden overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-800 p-4 text-center shadow-xl lg:block">
            <p className="font-poppins text-sm font-extrabold text-white">
              Calculate your duty
            </p>
            <p className="mt-1 font-inter text-xs leading-relaxed text-white/70">
              Free instant estimate for mortgage &amp; loan deeds.
            </p>
            <Link
              to="/"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 font-inter text-xs font-bold text-indigo-700 shadow-md transition hover:bg-indigo-50 active:scale-95"
            >
              <CalculatorIcon className="h-3.5 w-3.5" />
              Open Calculator
            </Link>
          </div>
        </motion.aside>
      </div>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-8 text-center font-inter text-xs text-slate-400 sm:px-6 lg:px-10">
        <p>
          &copy; {new Date().getFullYear()} Rajasthan Stamp Duty Calculator. All rights reserved.
        </p>
        <p className="mt-0.5">
          Developed by <span className="font-semibold text-slate-500">MG Labs</span>
        </p>
      </footer>
    </div>
  );
}
