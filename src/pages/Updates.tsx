import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Stamp, Newspaper } from "lucide-react";
import { UPDATES } from "../data/updates";
import { useDocumentMeta } from "../lib/useDocumentMeta";

const TAG_STYLES: Record<string, string> = {
  Launch: "bg-indigo-100 text-indigo-700",
  PWA: "bg-emerald-100 text-emerald-700",
  SEO: "bg-amber-100 text-amber-700",
  Design: "bg-fuchsia-100 text-fuchsia-700",
  Feature: "bg-sky-100 text-sky-700",
};

export default function Updates() {
  useDocumentMeta({
    title: "Updates | Rajasthan Stamp Duty Calculator",
    description:
      "Release notes for the Rajasthan Stamp Duty Calculator — new features, rate changes, and design updates.",
    path: "/updates",
  });

  return (
    <div className="font-inter min-h-screen w-full bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-poppins { font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-800 to-slate-900 px-4 pb-16 pt-6 sm:px-6">
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
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/30 blur-3xl"
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
              to="/blog"
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-inter text-xs font-semibold text-white/90 backdrop-blur transition hover:bg-white/20 active:scale-95"
            >
              <Newspaper className="h-3.5 w-3.5" />
              Read the blog
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="flex flex-col gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur">
              <Stamp className="h-6 w-6" />
            </div>
            <h1 className="font-poppins text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Product Updates
            </h1>
            <p className="max-w-md font-inter text-sm leading-relaxed text-white/70">
              What's new in the Rajasthan Stamp Duty Calculator — features,
              rate changes, and design improvements, in one place.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Timeline */}
      <div className="m-auto -mt-10 flex w-full max-w-xl flex-col gap-4 px-4 pb-10 sm:px-6">
        {UPDATES.map((update, i) => {
          const Icon = update.icon;
          return (
            <motion.article
              key={update.date + update.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 26,
                delay: i * 0.06,
              }}
              className="flex gap-3.5 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200/70 sm:p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 font-inter text-[11px] font-bold ${
                      TAG_STYLES[update.tag] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {update.tag}
                  </span>
                  <time
                    dateTime={update.date}
                    className="font-inter text-xs text-slate-400"
                  >
                    {update.label}
                  </time>
                </div>
                <h2 className="mt-1.5 font-poppins text-sm font-bold text-slate-900">
                  {update.title}
                </h2>
                <p className="mt-1 font-inter text-xs leading-relaxed text-slate-500">
                  {update.body}
                </p>
              </div>
            </motion.article>
          );
        })}

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
