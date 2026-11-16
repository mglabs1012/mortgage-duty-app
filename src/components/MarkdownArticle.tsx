import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-10 font-display text-xl font-extrabold tracking-tight text-ink first:mt-0 sm:text-2xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 font-display text-lg font-bold tracking-tight text-ink">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-[15px] leading-[1.8] text-ink-2 sm:text-base">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-accent underline decoration-accent/30 decoration-2 underline-offset-4 transition-colors hover:decoration-accent"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-ink-2 sm:text-base [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-1 [&>li]:before:top-[0.7em] [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full [&>li]:before:bg-accent/70">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-[15px] leading-relaxed text-ink-2 marker:font-semibold marker:text-accent sm:text-base">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] px-5 py-4 text-sm leading-relaxed text-amber-900 dark:text-amber-200 [&_p]:mt-0 [&_p]:text-inherit [&_strong]:text-inherit">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-line" />,
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-surface-2 text-xs font-semibold uppercase tracking-wide text-muted">
      {children}
    </thead>
  ),
  th: ({ children, style }) => (
    <th className="border-b border-line px-4 py-3 whitespace-nowrap" style={style}>
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td className="border-b border-line px-4 py-3 tabular-nums text-ink-2" style={style}>
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="transition-colors hover:bg-surface-2/60 last:[&>td]:border-b-0">{children}</tr>
  ),
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
