import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Megaphone } from "lucide-react";
import { POSTS } from "../data/posts";
import { useDocumentMeta } from "../lib/useDocumentMeta";

export default function BlogIndex() {
  useDocumentMeta({
    title: "Blog | Rajasthan Stamp Duty Calculator",
    description:
      "Guides on Rajasthan mortgage stamp duty, registration fees, MODT, MSME concessions, and the statutory rules behind mortgage and loan deeds.",
    path: "/blog",
  });

  return (
    <div className="font-inter min-h-screen w-full bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-poppins { font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-800 to-slate-900 px-4 pb-10 pt-6 sm:px-6 sm:pb-12">
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

        <div className="relative m-auto flex w-full max-w-xl flex-col gap-6">
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
            <p className="max-w-md font-inter text-sm leading-relaxed text-white/70">
              Guides on Rajasthan mortgage stamp duty, registration fees, and
              the statutory rules behind mortgage and loan deeds.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Post list */}
      <div className="m-auto flex w-full max-w-xl flex-col gap-4 px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        {POSTS.map((post, i) => (
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
              className="group block rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200/70 transition hover:ring-indigo-300 sm:p-5"
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
                <span className="font-inter text-xs text-slate-300">·</span>
                <span className="font-inter text-xs text-slate-400">
                  {post.meta.readingTime}
                </span>
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

        <footer className="mt-2 px-1 pb-1 text-center font-inter text-xs text-slate-400">
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
