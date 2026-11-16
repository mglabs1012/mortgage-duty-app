import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ListTree } from "lucide-react";

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

  const activeIndex = Math.max(
    0,
    items.findIndex((i) => i.id === activeId)
  );
  const progress = items.length > 1 ? activeIndex / (items.length - 1) : 0;

  return (
    <nav aria-label="Table of contents" className="card p-4">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <ListTree className="h-4 w-4 text-accent" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">On this page</p>
        </div>
        <span className="text-[11px] font-semibold tabular-nums text-muted">
          {activeId ? activeIndex + 1 : 0}/{items.length}
        </span>
      </div>
      <div className="relative mt-3">
        <span aria-hidden className="absolute bottom-1 left-[5px] top-1 w-px bg-line-strong" />
        <motion.span
          aria-hidden
          className="absolute left-[5px] top-1 w-px origin-top bg-accent"
          style={{ height: "calc(100% - 8px)" }}
          animate={{ scaleY: activeId ? progress : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
        />
        <ul className="max-h-[55vh] space-y-0.5 overflow-y-auto">
          {items.map((item, i) => {
            const isActive = activeId === item.id;
            const isPast = activeId !== "" && i < activeIndex;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`group relative flex items-start gap-3 rounded-lg py-1.5 pr-2 text-[13px] leading-snug transition-colors ${
                    isActive ? "font-semibold text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`relative z-10 mt-[5px] h-[11px] w-[11px] shrink-0 rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? "scale-110 border-accent bg-accent shadow-[0_0_0_4px_var(--accent-soft)]"
                        : isPast
                          ? "border-accent bg-surface"
                          : "border-line-strong bg-surface group-hover:border-ink-2"
                    }`}
                  />
                  {item.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
