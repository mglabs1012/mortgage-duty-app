import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Megaphone,
  Calculator as CalculatorIcon,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { POSTS } from "../data/posts";
import { UPDATES } from "../data/updates";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { splitMarkdownSections } from "../lib/markdown";

export default function BlogIndex() {
  useDocumentMeta({
    title: "Blog | Rajasthan Stamp Duty Calculator",
    description:
      "Guides on Rajasthan mortgage stamp duty, registration fees, MODT, MSME concessions, and the statutory rules behind mortgage and loan deeds.",
    path: "/blog",
  });

  const [featured, ...rest] = POSTS;
  const latestUpdate = UPDATES[0];
  const topics = featured ? splitMarkdownSections(featured.body).map((s) => s.title) : [];

  return (
    <div className="font-inter min-h-screen w-full bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-poppins { font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-800 to-slate-900 px-4 pb-10 pt-6 sm:px-6 sm:pb-12 lg:px-10">
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
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-40 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl"
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-inter text-xs font-semibold text-white/90 backdrop-blur transition hover:bg-white/20 active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to calculator
            </Link>
            <Link
              to="/updates"
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-inter text-xs font-semibold text-white/90 backdrop-blur transition hover:bg-white/20 active:scale-95"
            >
              <Megaphone className="h-3.5 w-3.5" />
              Product updates
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="flex flex-col gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur">
              <BookOpen className="h-6 w-6" />
            </div>
            <h1 className="font-poppins text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Blog
            </h1>
            <p className="max-w-lg font-inter text-sm leading-relaxed text-white/70">
              Guides on Rajasthan mortgage stamp duty, registration fees, and
              the statutory rules behind mortgage and loan deeds.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-8 sm:px-6 lg:px-10 lg:pt-10">
        {featured && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Featured article */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="lg:col-span-2"
            >
              <Link
                to={`/blog/${featured.meta.slug}`}
                className="group block overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200/70 transition hover:shadow-2xl hover:ring-indigo-300"
              >
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-700 to-slate-900 p-7 sm:p-10">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-25"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                      backgroundSize: "22px 22px",
                    }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/15"
                  />
                  <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-inter text-[11px] font-bold text-white backdrop-blur">
                    <Sparkles className="h-3 w-3" />
                    Featured Guide
                  </span>
                  <h2 className="relative mt-4 max-w-xl font-poppins text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                    {featured.meta.title}
                  </h2>
                </div>
                <div className="p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-inter text-[11px] font-bold text-indigo-700">
                      {featured.meta.tag}
                    </span>
                    <time
                      dateTime={featured.meta.date}
                      className="font-inter text-xs text-slate-400"
                    >
                      {featured.meta.dateLabel}
                    </time>
                    <span className="font-inter text-xs text-slate-300">·</span>
                    <span className="font-inter text-xs text-slate-400">
                      {featured.meta.readingTime}
                    </span>
                  </div>
                  <p className="mt-3 font-inter text-sm leading-relaxed text-slate-600 sm:text-base">
                    {featured.meta.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-inter text-sm font-bold text-indigo-700">
                    Read full article
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.08 }}
              className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start"
            >
              {topics.length > 0 && (
                <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200/70">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-indigo-600" />
                    <h3 className="font-poppins text-sm font-bold text-slate-800">
                      What this guide covers
                    </h3>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {topics.slice(0, 7).map((t) => (
                      <li
                        key={t}
                        className="flex items-start gap-2 font-inter text-xs leading-relaxed text-slate-600"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {latestUpdate && (
                <Link
                  to="/updates"
                  className="group block rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200/70 transition hover:ring-indigo-300"
                >
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-violet-600" />
                    <h3 className="font-poppins text-sm font-bold text-slate-800">
                      Latest product update
                    </h3>
                  </div>
                  <p className="mt-2 font-inter text-xs font-semibold text-slate-700">
                    {latestUpdate.title}
                  </p>
                  <p className="mt-1 line-clamp-2 font-inter text-xs leading-relaxed text-slate-500">
                    {latestUpdate.body}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 font-inter text-xs font-bold text-indigo-700">
                    View all updates
                    <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              )}

              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-5 text-center shadow-xl">
                <p className="font-poppins text-sm font-extrabold text-white">
                  Know your exact duty
                </p>
                <p className="mt-1 font-inter text-xs leading-relaxed text-white/70">
                  Instant Rajasthan mortgage stamp duty &amp; registration fee
                  estimate.
                </p>
                <Link
                  to="/"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 font-inter text-xs font-bold text-indigo-700 shadow-md transition hover:bg-indigo-50 active:scale-95"
                >
                  <CalculatorIcon className="h-3.5 w-3.5" />
                  Open Calculator
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        {/* Additional posts, once published, appear here as a card grid */}
        {rest.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <motion.div
                key={post.meta.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 26,
                  delay: i * 0.06,
                }}
              >
                <Link
                  to={`/blog/${post.meta.slug}`}
                  className="group block h-full rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200/70 transition hover:ring-indigo-300 sm:p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-inter text-[11px] font-bold text-indigo-700">
                      {post.meta.tag}
                    </span>
                    <time
                      dateTime={post.meta.date}
                      className="font-inter text-xs text-slate-400"
                    >
                      {post.meta.dateLabel}
                    </time>
                  </div>
                  <h2 className="font-poppins mt-2 text-base font-bold text-slate-900 group-hover:text-indigo-700">
                    {post.meta.title}
                  </h2>
                  <p className="mt-1.5 font-inter text-sm leading-relaxed text-slate-500">
                    {post.meta.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 font-inter text-xs font-bold text-indigo-700">
                    Read article
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <footer className="mt-10 px-1 pb-1 text-center font-inter text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Rajasthan Stamp Duty Calculator. All rights reserved.
          </p>
          <p className="mt-0.5">
            Developed by <span className="font-semibold text-slate-500">MG Labs</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
