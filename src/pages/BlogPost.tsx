import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator as CalculatorIcon, FileText } from "lucide-react";
import { getPostBySlug } from "../data/posts";
import { MarkdownArticle } from "../components/MarkdownArticle";
import { FaqAccordion } from "../components/FaqAccordion";
import { useDocumentMeta } from "../lib/useDocumentMeta";

const SITE_URL = "https://mortgage-duty-app.vercel.app";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  useDocumentMeta({
    title: post ? `${post.meta.title} | Rajasthan Stamp Duty Calculator` : "Post not found",
    description: post?.meta.description ?? "This article could not be found.",
    path: post ? `/blog/${post.meta.slug}` : "/blog",
    type: post ? "article" : "website",
  });

  if (!post) {
    return (
      <div className="font-inter flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap');
          .font-inter { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
          .font-poppins { font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; }
        `}</style>
        <p className="font-poppins text-xl font-extrabold text-slate-900">Article not found</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 font-inter text-sm font-semibold text-white transition hover:bg-indigo-700"
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-poppins { font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-800 to-slate-900 px-4 pb-14 pt-6 sm:px-6">
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

        <div className="relative m-auto flex w-full max-w-2xl flex-col gap-5">
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
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="flex flex-col gap-3"
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
            <h1 className="font-poppins text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              {post.meta.title}
            </h1>
            <p className="max-w-xl font-inter text-sm leading-relaxed text-white/70">
              {post.meta.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Article body */}
      <div className="m-auto -mt-8 flex w-full max-w-2xl flex-col gap-4 px-4 pb-10 sm:px-6">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200/70 sm:p-7"
        >
          <MarkdownArticle markdown={post.body} />
        </motion.article>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.05 }}
          aria-labelledby="post-faq-heading"
          className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200/70 sm:p-5"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            <h2 id="post-faq-heading" className="font-poppins text-sm font-bold text-slate-800">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mt-2">
            <FaqAccordion items={post.faq} />
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.1 }}
          className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-5 py-6 text-center shadow-xl"
        >
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
        </motion.div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

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
