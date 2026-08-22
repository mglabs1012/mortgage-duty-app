import { useEffect, useState } from "react";
import { List } from "lucide-react";

export type TocItem = { id: string; title: string };

/**
 * Owns its own scroll-driven active-section state via IntersectionObserver,
 * so a scroll tick only re-renders this small nav — not the whole article.
 */
export function TableOfContents({ items, watchKey }: { items: TocItem[]; watchKey: string }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
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
  }, [watchKey, items.length]);

  return (
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
        {items.map((item) => {
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
  );
}
