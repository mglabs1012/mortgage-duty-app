import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";

type FaqItem = { q: string; a: string };

const spring = { type: "spring" as const, stiffness: 380, damping: 34 };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div
            key={item.q}
            className={`rounded-2xl border transition-colors duration-300 ${
              isOpen ? "border-line-strong bg-surface-2" : "border-line bg-surface hover:bg-surface-2/60"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left sm:px-5 sm:py-4"
            >
              <span
                className={`text-sm font-semibold transition-colors sm:text-[15px] ${
                  isOpen ? "text-ink" : "text-ink-2"
                }`}
              >
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 135 : 0 }}
                transition={spring}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                  isOpen
                    ? "bg-gradient-to-b from-brand-500 to-brand-700 text-white"
                    : "bg-surface-3 text-ink-2"
                }`}
              >
                <Plus className="h-4 w-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={spring}
                  className="overflow-hidden"
                >
                  <motion.p
                    initial={{ y: -6 }}
                    animate={{ y: 0 }}
                    transition={spring}
                    className="px-4 pb-4 pr-12 text-sm leading-relaxed text-muted sm:px-5 sm:pb-5"
                  >
                    {item.a}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
