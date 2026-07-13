import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

type FaqItem = { q: string; a: string };

const spring = { type: "spring" as const, stiffness: 380, damping: 32 };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-slate-100">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
            >
              <span
                className={`font-inter text-sm font-semibold transition-colors ${
                  isOpen ? "text-indigo-700" : "text-slate-700"
                }`}
              >
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={spring}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isOpen ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={spring}
                  className="overflow-hidden"
                >
                  <p className="pb-4 pr-9 font-inter text-xs leading-relaxed text-slate-500">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
