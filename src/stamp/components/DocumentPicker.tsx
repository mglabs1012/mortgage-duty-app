import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, ChevronDown, Search, X } from "lucide-react";
import type { Instrument } from "../types.ts";
import {
  HEADS,
  QUICK_PICKS,
  byId,
  displayName,
  headMeta,
  instrumentsOf,
  ruleBadge,
  searchInstruments,
} from "../catalog.ts";

const ease = [0.22, 1, 0.36, 1] as const;

function InstrumentRow({
  ins,
  active,
  onPick,
  showHead = false,
}: {
  ins: Instrument;
  active: boolean;
  onPick: (id: string) => void;
  showHead?: boolean;
}) {
  const badge = ruleBadge(ins.sd);
  const meta = headMeta(ins.head);
  return (
    <button
      type="button"
      onClick={() => onPick(ins.id)}
      className={`group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        active ? "bg-accent-soft" : "hover:bg-surface-2"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          active ? "border-accent bg-accent text-white" : "border-line-strong group-hover:border-ink-2"
        }`}
      >
        {active && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        {showHead && (
          <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
            {meta.label}
            {ins.group ? ` · ${ins.group}` : ""}
          </span>
        )}
        <span className={`block text-sm leading-snug ${active ? "font-semibold text-ink" : "text-ink-2"}`}>
          {displayName(ins)}
        </span>
      </span>
      <span
        className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
          badge === "Nil" ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" : "bg-surface-3 text-ink-2"
        }`}
      >
        {badge}
      </span>
    </button>
  );
}

export function DocumentPicker({
  selectedId,
  onPick,
}: {
  selectedId: string | null;
  onPick: (id: string) => void;
}) {
  const selected = byId(selectedId);
  const [query, setQuery] = useState("");
  const [head, setHead] = useState<string | null>(selected?.head ?? null);
  const [showAllHeads, setShowAllHeads] = useState(false);
  const [collapsed, setCollapsed] = useState(!!selected);

  const results = useMemo(() => searchInstruments(query), [query]);
  const list = useMemo(() => (head ? instrumentsOf(head) : []), [head]);

  const pick = (id: string) => {
    onPick(id);
    const ins = byId(id);
    if (ins) setHead(ins.head);
    setQuery("");
    setCollapsed(true);
  };

  /* ---------- Collapsed summary once a document is chosen ---------- */
  if (collapsed && selected) {
    const meta = headMeta(selected.head);
    return (
      <motion.button
        type="button"
        layout
        onClick={() => setCollapsed(false)}
        className="card group flex w-full items-center gap-4 p-4 text-left transition-colors hover:border-line-strong sm:p-5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow">
          <meta.icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
            {meta.label}
            {selected.group ? ` · ${selected.group}` : ""}
          </span>
          <span className="mt-0.5 block font-display text-[15px] font-bold leading-snug text-ink">
            {displayName(selected)}
          </span>
          <span className="mt-1 block text-xs text-muted">
            Article {selected.article || "—"}
            {selected.book ? ` · Book ${selected.book}` : ""} · Fees Master S.No. {selected.sno}
          </span>
        </span>
        <span className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-2 transition-colors group-hover:bg-surface-2 group-hover:text-ink">
          Change
        </span>
      </motion.button>
    );
  }

  const visibleHeads = showAllHeads ? HEADS : HEADS.slice(0, 12);
  const groups = list.reduce<{ name: string | null; items: Instrument[] }[]>((acc, ins) => {
    const last = acc[acc.length - 1];
    if (last && last.name === ins.group) last.items.push(ins);
    else acc.push({ name: ins.group, items: [ins] });
    return acc;
  }, []);

  return (
    <motion.section layout className="card p-5 sm:p-6" aria-label="Choose the document">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
            1
          </span>
          <h2 className="font-display text-base font-bold text-ink">Which document?</h2>
        </div>
        {selected && (
          <button type="button" onClick={() => setCollapsed(true)} className="text-xs font-semibold text-accent">
            Done
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 360+ documents — e.g. gift brother, rent, mukhtarnama"
          aria-label="Search documents"
          className="h-12 w-full rounded-2xl border border-line bg-surface-2 pl-11 pr-10 text-sm text-ink outline-none transition-all placeholder:text-muted focus:border-accent/60 focus:bg-surface focus:shadow-[0_0_0_4px_var(--accent-soft)] [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-surface-3 text-ink-2"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {query ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
            className="mt-3"
          >
            <p className="px-1 text-xs text-muted">
              {results.length ? `${results.length}${results.length === 40 ? "+" : ""} matches` : "No matching document — try fewer words"}
            </p>
            <div className="mt-2 max-h-[26rem] space-y-0.5 overflow-y-auto pr-1">
              {results.map((ins) => (
                <InstrumentRow key={ins.id} ins={ins} active={ins.id === selectedId} onPick={pick} showHead />
              ))}
            </div>
          </motion.div>
        ) : head ? (
          <motion.div
            key={`head-${head}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease }}
            className="mt-4"
          >
            <button
              type="button"
              onClick={() => setHead(null)}
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-ink-2 hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              All document types
            </button>
            <div className="mt-3 flex items-center gap-3">
              {(() => {
                const m = headMeta(head);
                return (
                  <>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <m.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-display text-base font-bold text-ink">{m.label}</p>
                      <p className="text-xs text-muted">
                        {m.hindi} · {list.length} options
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="mt-3 max-h-[28rem] overflow-y-auto pr-1">
              {groups.map((g, gi) => (
                <div key={`${g.name}-${gi}`} className={g.name ? "mt-3 first:mt-0" : ""}>
                  {g.name && (
                    <p className="sticky top-0 z-10 bg-surface/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted backdrop-blur">
                      {g.name}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {g.items.map((ins) => (
                      <InstrumentRow key={ins.id} ins={ins} active={ins.id === selectedId} onPick={pick} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="browse"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25, ease }}
          >
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">Quick picks</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_PICKS.map((q) => (
                <motion.button
                  key={q.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => pick(q.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    selectedId === q.id
                      ? "border-transparent bg-gradient-to-b from-brand-500 to-brand-700 text-white"
                      : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {q.label}
                </motion.button>
              ))}
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">Browse by type</p>
            <motion.div layout className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {visibleHeads.map((h, i) => (
                <motion.button
                  key={h.head}
                  type="button"
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 12) * 0.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setHead(h.head)}
                  className="group flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-2.5 text-left transition-colors hover:border-line-strong hover:bg-surface-2"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2 transition-colors group-hover:bg-accent-soft group-hover:text-accent">
                    <h.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-ink">{h.label}</span>
                    <span className="block truncate text-[11px] text-muted">
                      {h.hindi} · {h.count}
                    </span>
                  </span>
                </motion.button>
              ))}
            </motion.div>
            <button
              type="button"
              onClick={() => setShowAllHeads((s) => !s)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent"
            >
              {showAllHeads ? "Show fewer" : `Show all ${HEADS.length} document types`}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAllHeads ? "rotate-180" : ""}`} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
