import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="font-poppins mt-8 text-xl font-extrabold text-slate-900 first:mt-0 sm:text-2xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-poppins mt-6 text-base font-bold text-slate-800 sm:text-lg">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-3 font-inter text-sm leading-relaxed text-slate-600 sm:text-base">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-slate-900">{children}</strong>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-2 transition hover:text-indigo-800"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mt-3 list-disc space-y-1.5 pl-5 font-inter text-sm leading-relaxed text-slate-600 sm:text-base">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-3 list-decimal space-y-1.5 pl-5 font-inter text-sm leading-relaxed text-slate-600 sm:text-base">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mt-5 rounded-xl bg-amber-50 px-4 py-3 font-inter text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200 sm:text-sm">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-slate-200" />,
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-slate-200">
      <table className="w-full border-collapse text-left font-inter text-xs sm:text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-50 font-poppins font-bold text-slate-700">
      {children}
    </thead>
  ),
  th: ({ children, style }) => (
    <th className="border-b border-slate-200 px-3 py-2" style={style}>
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td
      className="border-b border-slate-100 px-3 py-2 text-slate-600 last:border-b-0"
      style={style}
    >
      {children}
    </td>
  ),
  tr: ({ children }) => <tr className="last:[&>td]:border-b-0">{children}</tr>,
};

export const MarkdownArticle = memo(function MarkdownArticle({ markdown }: { markdown: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
});
