import { motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { amountInWords, grouped } from "../../lib/stampDuty";
import { PARTY_CATEGORIES } from "../constants.ts";
import type { PartyCategoryId } from "../types.ts";
import type { FieldSpec } from "../engine.ts";

const inputShell =
  "flex items-center rounded-2xl border border-line bg-surface-2 px-4 transition-all duration-300 focus-within:border-accent/60 focus-within:bg-surface focus-within:shadow-[0_0_0_4px_var(--accent-soft)]";

function Help({ spec }: { spec: FieldSpec }) {
  return spec.help ? <p className="mt-1.5 text-xs leading-snug text-muted">{spec.help}</p> : null;
}

function Label({ spec, right }: { spec: FieldSpec; right?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-2">
      <div className="min-w-0">
        <label htmlFor={`f-${spec.field}`} className="block text-sm font-semibold text-ink">
          {spec.label}
        </label>
      </div>
      {right}
    </div>
  );
}

export function MoneyField({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: number;
  onChange: (n: number) => void;
}) {
  const digits = value ? String(value) : "";
  const words = amountInWords(value);
  return (
    <div>
      <Label
        spec={spec}
        right={
          words ? (
            <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent-ink">
              ₹ {words}
            </span>
          ) : null
        }
      />
      <div className={`${inputShell} py-3`}>
        <span className="mr-2 font-display text-xl font-semibold text-muted">₹</span>
        <input
          id={`f-${spec.field}`}
          inputMode="numeric"
          autoComplete="off"
          value={grouped(digits)}
          placeholder="0"
          onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "").slice(0, 13) || 0))}
          className="w-full bg-transparent font-display text-xl font-bold tabular-nums tracking-tight text-ink outline-none placeholder:text-muted/50"
        />
      </div>
      <Help spec={spec} />
    </div>
  );
}

export function PercentField({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <Label spec={spec} />
      <div className={`${inputShell} py-3`}>
        <input
          id={`f-${spec.field}`}
          type="number"
          min={0}
          max={100}
          inputMode="decimal"
          value={value || ""}
          placeholder="0"
          onChange={(e) => onChange(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
          className="w-full bg-transparent font-display text-xl font-bold tabular-nums text-ink outline-none placeholder:text-muted/50"
        />
        <span className="ml-2 font-display text-xl font-semibold text-muted">%</span>
      </div>
      <Help spec={spec} />
    </div>
  );
}

export function PeriodField({
  spec,
  months,
  onChange,
}: {
  spec: FieldSpec;
  months: number;
  onChange: (n: number) => void;
}) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const set = (yy: number, mm: number) => onChange(Math.max(0, Math.min(99, yy)) * 12 + Math.max(0, Math.min(11, mm)));
  const presets = [
    { label: "11 mo", v: 11 },
    { label: "3 yr", v: 36 },
    { label: "5 yr", v: 60 },
    { label: "10 yr", v: 120 },
  ];
  return (
    <div>
      <Label spec={spec} />
      <div className="grid grid-cols-2 gap-2">
        <div className={`${inputShell} py-2.5`}>
          <input
            id={`f-${spec.field}`}
            type="number"
            min={0}
            inputMode="numeric"
            value={y || ""}
            placeholder="0"
            onChange={(e) => set(Number(e.target.value) || 0, m)}
            className="w-full bg-transparent font-display text-lg font-bold tabular-nums text-ink outline-none placeholder:text-muted/50"
            aria-label="Years"
          />
          <span className="text-sm text-muted">years</span>
        </div>
        <div className={`${inputShell} py-2.5`}>
          <input
            type="number"
            min={0}
            max={11}
            inputMode="numeric"
            value={m || ""}
            placeholder="0"
            onChange={(e) => set(y, Number(e.target.value) || 0)}
            className="w-full bg-transparent font-display text-lg font-bold tabular-nums text-ink outline-none placeholder:text-muted/50"
            aria-label="Months"
          />
          <span className="text-sm text-muted">months</span>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.v}
            type="button"
            onClick={() => onChange(p.v)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              months === p.v ? "border-accent bg-accent-soft text-accent-ink" : "border-line text-ink-2 hover:bg-surface-2"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <Help spec={spec} />
    </div>
  );
}

export function CountField({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: number;
  onChange: (n: number) => void;
}) {
  const n = Math.max(1, value || 1);
  return (
    <div>
      <Label spec={spec} />
      <div className="inline-flex items-center gap-1 rounded-2xl border border-line bg-surface-2 p-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(Math.max(1, n - 1))}
          aria-label="Decrease"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 hover:bg-surface"
        >
          <Minus className="h-4 w-4" />
        </motion.button>
        <span className="w-12 text-center font-display text-lg font-bold tabular-nums text-ink">{n}</span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(Math.min(999, n + 1))}
          aria-label="Increase"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 hover:bg-surface"
        >
          <Plus className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}

export function PartyCategoryPicker({
  value,
  onChange,
}: {
  value: PartyCategoryId;
  onChange: (id: PartyCategoryId) => void;
}) {
  return (
    <div>
      <p id="party-cat" className="text-sm font-semibold text-ink">
        In whose favour? <span className="font-normal text-muted">· buyer / claimant category</span>
      </p>
      <p className="mt-0.5 text-xs text-muted">
        Concessional rates apply to women, persons with disability and transgender persons.
      </p>
      <div role="radiogroup" aria-labelledby="party-cat" className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {PARTY_CATEGORIES.map((c) => {
          const active = value === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(c.id)}
              className="relative flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left"
            >
              {active && (
                <motion.span
                  layoutId="party-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl border border-accent/40 bg-accent-soft"
                />
              )}
              {!active && <span className="absolute inset-0 rounded-xl border border-line" />}
              <span className={`relative text-[13px] leading-snug ${active ? "font-semibold text-ink" : "text-ink-2"}`}>
                {c.label}
              </span>
              <span
                className={`relative shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                  c.rate < 6 ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" : "bg-surface-3 text-ink-2"
                }`}
              >
                {c.rate === 0 ? "Remitted" : `${c.rate}%`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
