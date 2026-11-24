import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  BadgeCheck,
  Calculator,
  Check,
  ChevronDown,
  FileSearch,
  Info,
  MapPin,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { AnimatedAmount } from "../../components/AnimatedAmount";
import { PARTY_CATEGORIES } from "../constants.ts";
import { computeDuty, rupees } from "../engine.ts";
import { ADD_ONS, addOnTotal, byId } from "../catalog.ts";
import type { DutyInputs, DutyResult, Instrument, PartyCategoryId } from "../types.ts";

const spring = { type: "spring" as const, stiffness: 420, damping: 34 };

function Row({
  label,
  hint,
  amount,
  before,
  strong = false,
}: {
  label: string;
  hint?: string;
  amount: number;
  before?: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className={`text-sm ${strong ? "font-semibold text-ink" : "text-ink-2"}`}>{label}</p>
        {hint && <p className="mt-0.5 text-xs leading-snug text-muted">{hint}</p>}
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-display tabular-nums ${strong ? "text-base font-extrabold text-ink" : "text-sm font-bold text-ink"}`}>
          {rupees(amount)}
        </p>
        {before !== undefined && before > amount && (
          <p className="text-[11px] tabular-nums text-muted line-through">{rupees(before)}</p>
        )}
      </div>
    </div>
  );
}

function Disclosure({ icon: Icon, title, children, defaultOpen = false }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Icon className="h-4 w-4 text-accent" />
          {title}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring} className="flex text-muted">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <div className="collapsible" data-open={open}>
        <div>
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ResultPanel({
  ins,
  result,
  inputs,
  addOns,
  onToggleAddOn,
  onCategory,
  totalRef,
}: {
  ins: Instrument;
  result: DutyResult;
  inputs: DutyInputs;
  addOns: string[];
  onToggleAddOn: (id: string) => void;
  onCategory: (id: PartyCategoryId) => void;
  totalRef?: React.Ref<HTMLDivElement>;
}) {
  const extras = addOnTotal(addOns);
  const grand = result.total + extras;
  const saving = result.totalBeforeRebate - result.total;
  const hasInput = result.value > 0 || result.sd > 0 || result.rf > 0;
  const catRows =
    result.categoryRate !== null && result.value > 0
      ? PARTY_CATEGORIES.map((c) => ({ ...c, total: computeDuty(ins, { ...inputs, category: c.id }).total }))
      : [];
  const minCat = catRows.length ? Math.min(...catRows.map((c) => c.total)) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* ---------- Total ---------- */}
      <motion.div
        ref={totalRef}
        layout
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-[0_24px_48px_-20px_rgb(17_29_56/0.55)] sm:p-7"
      >
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-800 to-brand-950" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "20px 20px",
            maskImage: "linear-gradient(to bottom left, black, transparent 70%)",
            WebkitMaskImage: "linear-gradient(to bottom left, black, transparent 70%)",
          }}
        />
        <div aria-hidden className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <motion.span
          key={grand}
          aria-hidden
          initial={{ x: "-120%" }}
          animate={{ x: "420%" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Total payable · कुल देय</p>
          <AnimatedAmount
            value={grand}
            className="mt-3 font-display text-[2.6rem] font-extrabold leading-none tracking-tight tabular-nums sm:text-[3.4rem]"
          />
          <p className="mt-3 text-sm text-white/70">
            Stamp duty {rupees(result.sd + result.surcharges.total)} · Registration {rupees(result.rf + result.csi + extras)}
          </p>
          <AnimatePresence initial={false}>
            {saving > 0 && hasInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-lg">
                  <Sparkles className="h-3.5 w-3.5" />
                  Rebate saves {rupees(saving)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ---------- Warnings ---------- */}
      <AnimatePresence initial={false}>
        {result.warnings.map((w) => (
          <motion.div
            key={w}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] p-4 text-sm text-amber-900 dark:text-amber-200"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {w}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ---------- Breakdown ---------- */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-sm font-bold text-ink">Breakdown</p>
          {result.inspection && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${
                result.inspection === "Compulsory"
                  ? "bg-rose-500/10 text-rose-700 ring-rose-500/25 dark:text-rose-300"
                  : result.inspection === "Random"
                    ? "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300"
                    : "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300"
              }`}
            >
              <MapPin className="h-3 w-3" />
              Site inspection: {result.inspection}
            </span>
          )}
        </div>
        <div className="mt-2 divide-y divide-line">
          <Row label="Stamp duty" hint={result.sdWorking} amount={result.sd} before={result.sdBeforeRebate} />
          <Row
            label={`Surcharge on stamp duty (${Math.round(result.surchargeRate * 100)}%)`}
            hint={`Infrastructure ${rupees(result.surcharges.infrastructure)} · Cow protection ${rupees(
              result.surcharges.cow
            )} · Natural calamity ${rupees(result.surcharges.calamity)}`}
            amount={result.surcharges.total}
          />
          <Row label="Registration fee" hint={result.rfWorking} amount={result.rf} before={result.rfBeforeRebate} />
          <Row label="CSI (copying, scanning & indexing)" amount={result.csi} />
          {addOns.map((id) => {
            const a = byId(id);
            const label = ADD_ONS.find((x) => x.id === id)?.label ?? a?.name ?? id;
            return a ? <Row key={id} label={label} hint="Registration service fee" amount={addOnTotal([id])} /> : null;
          })}
          <div className="!border-t-2 !border-ink">
            <Row label="Total payable" amount={grand} strong />
          </div>
        </div>
      </div>

      {/* ---------- Conditions ---------- */}
      {result.conditions.length > 0 && (
        <div className="card p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <BadgeCheck className="h-4 w-4 text-emerald-500" /> Conditions & notes
          </p>
          <ul className="mt-3 space-y-2">
            {result.conditions.map((c) => (
              <li key={c} className="flex gap-2 text-sm leading-relaxed text-ink-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------- Compare categories / add-ons / wording ---------- */}
      <div className="card px-5 sm:px-6">
        {catRows.length > 0 && (
          <Disclosure icon={Calculator} title="Compare by buyer category" defaultOpen>
            <p className="mb-2 text-xs text-muted">Tap a row to use that category.</p>
            <div className="overflow-hidden rounded-xl border border-line">
              {catRows.map((c) => {
                const active = inputs.category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onCategory(c.id)}
                    className={`flex w-full items-center justify-between gap-2 border-b border-line px-3 py-2 text-left text-sm last:border-b-0 transition-colors ${
                      active ? "bg-accent-soft" : "hover:bg-surface-2"
                    }`}
                  >
                    <span className={`flex items-center gap-2 ${active ? "font-semibold text-ink" : "text-ink-2"}`}>
                      {active ? <Check className="h-3.5 w-3.5 text-accent" /> : <span className="w-3.5" />}
                      {c.short}
                      <span className="text-xs text-muted">{c.rate === 0 ? "remitted" : `${c.rate}%`}</span>
                    </span>
                    <span className="flex items-center gap-2 font-display font-bold tabular-nums text-ink">
                      {c.total === minCat && c.total < catRows[0].total && (
                        <span className="rounded bg-emerald-500/12 px-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          LOWEST
                        </span>
                      )}
                      {rupees(c.total)}
                    </span>
                  </button>
                );
              })}
            </div>
          </Disclosure>
        )}

        <Disclosure icon={PlusCircle} title={`Add registration services${addOns.length ? ` (${addOns.length})` : ""}`}>
          <div className="space-y-1">
            {ADD_ONS.map((a) => {
              const on = addOns.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                    on ? "bg-accent-soft" : "hover:bg-surface-2"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => onToggleAddOn(a.id)}
                      className="h-4 w-4 rounded accent-[var(--accent)]"
                    />
                    <span className={on ? "font-medium text-ink" : "text-ink-2"}>{a.label}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-ink">{rupees(addOnTotal([a.id]))}</span>
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">No attendance fee for persons aged 70+ or with 80%+ disability.</p>
        </Disclosure>

        <Disclosure icon={FileSearch} title="What the Fees Master says">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {[
              ["Article", ins.article],
              ["Stamp duty", ins.raw.sd],
              ["SD after rebate", ins.raw.sdRebate],
              ["Rebate notification", ins.raw.sdNotification],
              ["Registration fee", ins.raw.rf],
              ["RF after rebate", ins.raw.rfRebate],
              ["RF notification", ins.raw.rfNotification],
              ["CSI fee", ins.raw.csi],
              ["Book No.", ins.book],
            ]
              .filter(([, v]) => v && v !== "-")
              .map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-ink-2">{v}</dd>
                </div>
              ))}
          </dl>
          <p className="mt-3 flex gap-2 text-xs text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Fees Master S.No. {ins.sno}, applicable on 07-05-2026.
          </p>
        </Disclosure>
      </div>
    </div>
  );
}
