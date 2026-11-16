import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgePercent,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  Copy,
  Factory,
  FileSignature,
  Globe,
  HardHat,
  Landmark,
  Printer,
  Receipt,
  Share2,
  ShieldCheck,
  Sparkles,
  Stamp,
  X,
} from "lucide-react";
import { FaqAccordion } from "../components/FaqAccordion";
import { AnimatedAmount } from "../components/AnimatedAmount";
import { Reveal } from "../components/Reveal";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import {
  CSI_CHARGE,
  CSI_MIN_LOAN,
  SURCHARGE_RATES,
  STAMP_RATE,
  STAMP_CAP,
  REG_RATE,
  REG_CAP,
  amountInWords,
  computeDuty,
  inr,
  grouped,
  pct,
  FAQ_ITEMS,
  faqSchema,
  type DutyCategory,
} from "../lib/stampDuty";

const ease = [0.22, 1, 0.36, 1] as const;
const spring = { type: "spring" as const, stiffness: 420, damping: 34 };

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

/* ---------- Loan slider: log scale from ₹10K to ₹100Cr ---------- */
const SLIDER_MIN_EXP = 4; // 10^4
const SLIDER_SPAN = 5; // up to 10^9
const SLIDER_STEPS = 1000;

function sliderToAmount(pos: number): number {
  const v = Math.pow(10, SLIDER_MIN_EXP + (pos / SLIDER_STEPS) * SLIDER_SPAN);
  const step = v < 1e5 ? 1e3 : v < 1e6 ? 1e4 : v < 1e7 ? 5e4 : v < 1e8 ? 5e5 : 5e6;
  return Math.round(v / step) * step;
}
function amountToSlider(amount: number): number {
  if (amount <= 0) return 0;
  const p = ((Math.log10(amount) - SLIDER_MIN_EXP) / SLIDER_SPAN) * SLIDER_STEPS;
  return Math.min(SLIDER_STEPS, Math.max(0, p));
}
const SLIDER_TICKS = ["10K", "1L", "10L", "1Cr", "10Cr", "100Cr"];

const PRESETS = [
  { label: "₹10L", v: "1000000" },
  { label: "₹25L", v: "2500000" },
  { label: "₹50L", v: "5000000" },
  { label: "₹1Cr", v: "10000000" },
];

const CATEGORIES: {
  id: DutyCategory;
  icon: React.ElementType;
  title: string;
  hint: string;
}[] = [
  {
    id: "Standard",
    icon: Building2,
    title: "Standard",
    hint: `${pct(STAMP_RATE.standard)}% · max ₹${amountInWords(STAMP_CAP.standard)}`,
  },
  {
    id: "MSME",
    icon: Factory,
    title: "MSME",
    hint: `${pct(STAMP_RATE.msme)}% · max ₹${amountInWords(STAMP_CAP.msme)}`,
  },
];

/* ---------- Ledger row (prints) ---------- */
type LedgerRowProps = {
  icon: React.ElementType;
  label: string;
  hindi: string;
  value: number;
  capped?: boolean;
  swatch?: string;
};

function LedgerRow({ icon: Icon, label, hindi, value, capped, swatch }: LedgerRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
          <Icon className="h-4 w-4" />
          {swatch && (
            <span
              aria-hidden
              className="no-print absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface"
              style={{ background: swatch }}
            />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium text-ink">{label}</span>
            {capped && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                Capped
              </span>
            )}
          </div>
          <span className="block text-xs text-muted">{hindi}</span>
        </div>
      </div>
      <span className="shrink-0 font-display text-sm font-bold tabular-nums text-ink">
        {inr(value)}
      </span>
    </div>
  );
}

/* ---------- Composition bar ---------- */
type Part = { key: string; label: string; value: number; color: string };

function CompositionBar({ parts, total }: { parts: Part[]; total: number }) {
  const [hover, setHover] = useState<string | null>(null);
  const visible = parts.filter((p) => p.value > 0);

  const geometry = visible.reduce<(Part & { share: number; start: number; mid: number })[]>(
    (acc, p) => {
      const share = total ? p.value / total : 0;
      const prev = acc[acc.length - 1];
      const start = prev ? prev.start + prev.share : 0;
      return [...acc, { ...p, share, start, mid: start + share / 2 }];
    },
    []
  );
  const hovered = geometry.find((g) => g.key === hover);

  const summary = total
    ? geometry.map((g) => `${g.label} ${inr(g.value)} (${Math.round(g.share * 100)}%)`).join(", ")
    : "No amount entered";

  return (
    <div>
      <div className="relative pt-1">
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="tip"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none absolute bottom-full z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line-strong bg-surface px-2.5 py-1.5 text-xs shadow-lg"
              style={{ left: `${Math.min(85, Math.max(15, hovered.mid * 100))}%` }}
            >
              <span className="font-semibold text-ink">{hovered.label}</span>
              <span className="mx-1.5 text-muted">·</span>
              <span className="tabular-nums text-ink-2">
                {inr(hovered.value)} ({Math.round(hovered.share * 100)}%)
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <div
          role="img"
          aria-label={`Cost composition: ${summary}`}
          className={`flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full ${total ? "" : "bg-surface-3"}`}
          onMouseLeave={() => setHover(null)}
        >
          {geometry.map((g) => (
            <motion.div
              key={g.key}
              initial={{ flexGrow: 0 }}
              animate={{ flexGrow: g.value, opacity: hover && hover !== g.key ? 0.3 : 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 26 }}
              onMouseEnter={() => setHover(g.key)}
              className="h-full min-w-[3px] basis-0 cursor-default"
              style={{ background: g.color }}
            />
          ))}
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {parts.map((p) => {
          const share = total ? Math.round((p.value / total) * 100) : 0;
          const dim = hover && hover !== p.key;
          return (
            <li
              key={p.key}
              onMouseEnter={() => p.value > 0 && setHover(p.key)}
              onMouseLeave={() => setHover(null)}
              className={`flex min-w-0 items-start gap-2 transition-opacity duration-200 ${dim ? "opacity-40" : ""}`}
            >
              <span
                aria-hidden
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ background: p.color }}
              />
              <div className="min-w-0">
                <p className="truncate text-xs text-muted">{p.label}</p>
                <p className="text-sm font-semibold tabular-nums text-ink">
                  {inr(p.value)}
                  <span className="ml-1.5 text-xs font-medium text-muted">{share}%</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ================================================================== */

export default function Calculator() {
  useDocumentMeta({
    title: "Rajasthan Stamp Duty Calculator 2026 | Mortgage & Loan Duty",
    description:
      "Free Rajasthan stamp duty calculator for mortgage & loan deeds. Instantly compute stamp duty, infrastructure/cow protection/natural calamity surcharges, registration fee & CSI charges for 2026, e-GRAS aligned.",
    path: "/",
  });

  const [raw, setRaw] = useState<string>("");
  const [category, setCategory] = useState<DutyCategory>("Standard");
  const [copied, setCopied] = useState<boolean>(false);
  // Breakdown open by default on desktop, collapsed on phones to keep the page short.
  const [open, setOpen] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );

  const loanAmount = Number(raw || 0);
  const isMsme = category === "MSME";

  const d = useMemo(() => computeDuty(loanAmount, category), [loanAmount, category]);
  const standard = useMemo(() => computeDuty(loanAmount, "Standard"), [loanAmount]);
  const msmeSavings = isMsme ? standard.grandTotal - d.grandTotal : 0;

  const today = new Date().toLocaleDateString("en-IN");

  /* ---- Mobile floating total bar: shown while the total card is off-screen ---- */
  const totalRef = useRef<HTMLDivElement>(null);
  const [totalInView, setTotalInView] = useState(true);
  useEffect(() => {
    const el = totalRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setTotalInView(e.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, "").replace(/^0+/, "").slice(0, 12);
    setRaw(digits);
  };

  const buildSummary = () =>
    [
      `Rajasthan ${category} Mortgage & Loan Duty`,
      `Loan Amount: ${inr(loanAmount)}`,
      `Date: ${today}`,
      `------------------------------`,
      `Stamp Duty Payable: ${inr(d.stampDuty)}`,
      `Infrastructure Surcharge (${pct(SURCHARGE_RATES.infrastructure)}%): ${inr(d.infraSurcharge)}`,
      `Cow Protection Surcharge (${pct(SURCHARGE_RATES.cowProtection)}%): ${inr(d.cowSurcharge)}`,
      `Natural Calamity Surcharge (${pct(SURCHARGE_RATES.naturalCalamity)}%): ${inr(d.calamitySurcharge)}`,
      `Registration Fee: ${inr(d.regFee)}`,
      `CSI Charges: ${inr(d.csi)}`,
      `------------------------------`,
      `TOTAL PAYABLE (approx.): ${inr(d.grandTotal)}`,
      ``,
      `Approximate figure, subject to final valuation by the Sub-Registrar.`,
      `Matches Rajasthan e-GRAS calculation (for guidance only).`,
    ].join("\n");

  const flashCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary());
      flashCopied();
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleShare = async () => {
    const text = buildSummary();
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Rajasthan Mortgage & Loan Duty", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      flashCopied();
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        flashCopied();
      } catch {
        /* user cancelled */
      }
    }
  };

  const handlePrint = () => {
    setOpen(true);
    // Let the breakdown expand before the print snapshot.
    requestAnimationFrame(() => window.print());
  };

  const parts: Part[] = [
    { key: "stamp", label: "Stamp duty", value: d.stampDuty, color: "var(--viz-1)" },
    { key: "surcharge", label: "Surcharges", value: d.surchargeTotal, color: "var(--viz-2)" },
    { key: "reg", label: "Registration fee", value: d.regFee, color: "var(--viz-3)" },
    { key: "csi", label: "CSI charge", value: d.csi, color: "var(--viz-4)" },
  ];

  const sliderPos = amountToSlider(loanAmount);
  const words = amountInWords(loanAmount);

  const appliedRates = [
    {
      label: "Stamp duty",
      value: `${pct(isMsme ? STAMP_RATE.msme : STAMP_RATE.standard)}%`,
      note: `cap ${inr(isMsme ? STAMP_CAP.msme : STAMP_CAP.standard)}`,
    },
    {
      label: "Surcharges",
      value: `${pct(
        SURCHARGE_RATES.infrastructure + SURCHARGE_RATES.cowProtection + SURCHARGE_RATES.naturalCalamity
      )}%`,
      note: "of stamp duty",
    },
    { label: "Registration", value: `${pct(REG_RATE)}%`, note: `cap ${inr(REG_CAP)}` },
    { label: "CSI portal", value: inr(CSI_CHARGE), note: `above ${inr(CSI_MIN_LOAN)}` },
  ];

  const steps = [
    {
      icon: Stamp,
      title: "Stamp duty",
      body: `${pct(STAMP_RATE.standard)}% of the loan amount (${pct(STAMP_RATE.msme)}% for MSMEs), capped at ${inr(
        STAMP_CAP.standard
      )} / ${inr(STAMP_CAP.msme)}.`,
      color: "var(--viz-1)",
    },
    {
      icon: ShieldCheck,
      title: "Three surcharges",
      body: `Infrastructure ${pct(SURCHARGE_RATES.infrastructure)}% + Cow Protection ${pct(
        SURCHARGE_RATES.cowProtection
      )}% + Natural Calamity ${pct(SURCHARGE_RATES.naturalCalamity)}%, all levied on the stamp duty.`,
      color: "var(--viz-2)",
    },
    {
      icon: FileSignature,
      title: "Registration + CSI",
      body: `Registration fee of ${pct(REG_RATE)}% (max ${inr(REG_CAP)}) plus a flat ${inr(
        CSI_CHARGE
      )} CSI portal charge on loans above ${inr(CSI_MIN_LOAN)}.`,
      color: "var(--viz-3)",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      {/* ---------------- Hero ---------------- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="no-print mx-auto mb-8 flex max-w-3xl flex-col items-center text-center sm:mb-10"
      >
        <motion.span
          variants={itemVariants}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-medium text-ink-2 shadow-sm backdrop-blur"
        >
          <span className="h-1.5 w-1.5 animate-pulse-ring rounded-full bg-emerald-500" />
          Updated for 2026 · e-GRAS aligned
        </motion.span>
        <motion.h1
          variants={itemVariants}
          className="mt-5 font-display text-[2rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]"
        >
          Rajasthan mortgage stamp duty,{" "}
          <span className="text-gradient">calculated instantly.</span>
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base"
        >
          Stamp duty, surcharges, registration fee and CSI charges for mortgage &amp; loan deeds —
          free, private, and right in your browser.
        </motion.p>
      </motion.div>

      {/* ---------------- Calculator grid ---------------- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 items-start gap-5 print:block lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-6"
      >
        {/* Inputs */}
        <motion.section
          variants={itemVariants}
          aria-label="Loan details"
          className="no-print card print-plain flex flex-col gap-6 p-5 sm:p-6 lg:col-start-1 lg:row-start-1"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="loan-amount" className="text-sm font-semibold text-ink">
                Loan amount <span className="font-normal text-muted">· ऋण राशि</span>
              </label>
              <AnimatePresence mode="popLayout" initial={false}>
                {words && (
                  <motion.span
                    key={words}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-ink"
                  >
                    ₹ {words}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="relative mt-3 flex items-center rounded-2xl border border-line bg-surface-2 px-4 py-3.5 transition-all duration-300 focus-within:border-accent/60 focus-within:bg-surface focus-within:shadow-[0_0_0_4px_var(--accent-soft)]">
              <span className="mr-2 font-display text-2xl font-semibold text-muted sm:text-3xl">₹</span>
              <input
                id="loan-amount"
                value={grouped(raw)}
                onChange={onChange}
                inputMode="numeric"
                autoComplete="off"
                type="text"
                placeholder="Enter amount"
                className="w-full bg-transparent pr-10 font-display text-2xl font-bold tabular-nums tracking-tight text-ink outline-none placeholder:font-semibold placeholder:text-muted/50 sm:text-3xl"
              />
              <AnimatePresence>
                {raw && (
                  <motion.button
                    type="button"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={spring}
                    onClick={() => setRaw("")}
                    aria-label="Clear amount"
                    className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface-3 text-ink-2 transition-colors hover:bg-red-500/15 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Slider */}
            <div className="mt-5">
              <input
                type="range"
                min={0}
                max={SLIDER_STEPS}
                step={1}
                value={sliderPos}
                onChange={(e) => setRaw(String(sliderToAmount(Number(e.target.value))))}
                aria-label="Loan amount slider"
                aria-valuetext={loanAmount ? inr(loanAmount) : "No amount"}
                className="range"
                style={
                  {
                    "--fill": `${(sliderPos / SLIDER_STEPS) * 100}%`,
                    "--range-color": isMsme ? "#10b981" : "var(--accent)",
                  } as React.CSSProperties
                }
              />
              <div className="mt-1 flex justify-between px-0.5 text-[10px] font-medium tabular-nums text-muted">
                {SLIDER_TICKS.map((t) => (
                  <span key={t}>₹{t}</span>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div className="mt-4 flex flex-wrap gap-2">
              {PRESETS.map((p) => {
                const active = raw === p.v;
                return (
                  <motion.button
                    type="button"
                    key={p.v}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setRaw(p.v)}
                    className={`relative rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "border-transparent text-white"
                        : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="preset-pill"
                        transition={spring}
                        className={`absolute inset-0 rounded-full ${
                          isMsme
                            ? "bg-gradient-to-b from-emerald-500 to-emerald-700"
                            : "bg-gradient-to-b from-brand-500 to-brand-700"
                        }`}
                      />
                    )}
                    <span className="relative">{p.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <p id="category-label" className="text-sm font-semibold text-ink">
              Borrower category
            </p>
            <div
              role="radiogroup"
              aria-labelledby="category-label"
              className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-1.5"
            >
              {CATEGORIES.map((c) => {
                const active = category === c.id;
                const msme = c.id === "MSME";
                return (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className="relative flex items-center gap-3 rounded-xl px-3 py-3 text-left"
                  >
                    {active && (
                      <motion.span
                        layoutId="category-pill"
                        transition={spring}
                        className="absolute inset-0 rounded-xl border border-line bg-surface shadow-[0_4px_14px_-6px_hsl(var(--shadow-color)/0.3)]"
                      />
                    )}
                    <span
                      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                        active
                          ? msme
                            ? "bg-gradient-to-br from-emerald-500 to-teal-700 text-white"
                            : "bg-gradient-to-br from-brand-500 to-brand-800 text-white"
                          : "bg-surface-3 text-muted"
                      }`}
                    >
                      <c.icon className="h-4 w-4" />
                    </span>
                    <span className="relative min-w-0">
                      <span
                        className={`block text-sm font-bold transition-colors ${active ? "text-ink" : "text-ink-2"}`}
                      >
                        {c.title}
                      </span>
                      <span className="block text-[11px] leading-snug text-muted">{c.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <AnimatePresence initial={false}>
              {isMsme && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                  className="overflow-hidden text-xs leading-relaxed text-muted"
                >
                  <span className="mt-2.5 block">
                    Requires a valid Udyam/MSME registration in the borrowing enterprise&apos;s name.
                  </span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Results */}
        <div className="flex flex-col gap-5 print:block lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {/* Total hero */}
          <motion.div
            ref={totalRef}
            variants={itemVariants}
            className="no-print print-plain relative overflow-hidden rounded-3xl p-6 text-white shadow-[0_24px_48px_-20px_rgb(17_29_56/0.55)] sm:p-7"
          >
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-800 to-brand-950"
              animate={{ opacity: isMsme ? 0 : 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-800 to-slate-950"
              initial={false}
              animate={{ opacity: isMsme ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            />
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
              key={d.grandTotal}
              aria-hidden
              initial={{ x: "-120%" }}
              animate={{ x: "420%" }}
              transition={{ duration: 1.1, ease }}
              className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />

            <div className="relative">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                  Total payable · कुल देय
                </p>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={category}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={spring}
                    className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-white/20 backdrop-blur"
                  >
                    {isMsme ? <Factory className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                    {category}
                  </motion.span>
                </AnimatePresence>
              </div>

              <AnimatedAmount
                value={d.grandTotal}
                className="mt-3 font-display text-[2.75rem] font-extrabold leading-none tracking-tight tabular-nums sm:text-6xl"
              />

              <p className="mt-3 text-sm text-white/70">
                {loanAmount ? (
                  <>
                    on a loan of <span className="font-semibold text-white">{inr(loanAmount)}</span>
                  </>
                ) : (
                  "Enter a loan amount to see your estimate"
                )}
              </p>

              <AnimatePresence initial={false}>
                {msmeSavings > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease }}
                    className="overflow-hidden"
                  >
                    <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-lg">
                      <Sparkles className="h-3.5 w-3.5" />
                      You save {inr(msmeSavings)} vs Standard
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-4 text-xs text-white/65">
                <span>≈ Approximate estimate</span>
                <a
                  href="https://egras.rajasthan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Verify on e-GRAS
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Composition */}
          <motion.div variants={itemVariants} className="no-print card print-plain p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="font-display text-sm font-bold text-ink">Where the money goes</p>
              <span className="text-xs text-muted">Hover to inspect</span>
            </div>
            <CompositionBar parts={parts} total={d.grandTotal} />
          </motion.div>

          {/* Receipt / breakdown (prints) */}
          <motion.div variants={itemVariants} id="receipt" className="card print-plain p-5 sm:p-6">
            <div className="mb-4 hidden print:block">
              <div className="font-display text-lg font-extrabold text-ink">
                Rajasthan Mortgage &amp; Loan Duty
              </div>
              <div className="text-xs text-muted">
                Statutory Fee Receipt · {category} category · {today}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="breakdown-body"
              className="-m-2 flex w-[calc(100%+1rem)] items-center justify-between gap-2 rounded-xl p-2 transition-colors hover:bg-surface-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Receipt className="h-4 w-4" />
                </span>
                <span className="font-display text-sm font-bold text-ink">Statutory breakdown</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-300 print:text-emerald-700">
                  <ShieldCheck className="h-3 w-3" />
                  e-GRAS
                </span>
                <motion.span
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={spring}
                  className="no-print flex text-muted"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </div>
            </button>

            <div id="breakdown-body" className="collapsible" data-open={open}>
              <div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-1 rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted">
                  <span>
                    {category} · Loan {inr(loanAmount)}
                  </span>
                  <span>Mortgage deed without possession · {today}</span>
                </div>

                <div className="mt-1">
                  <LedgerRow
                    icon={Stamp}
                    label="Stamp duty payable"
                    hindi="स्टाम्प ड्यूटी"
                    value={d.stampDuty}
                    capped={d.stampCapped}
                    swatch="var(--viz-1)"
                  />
                  <LedgerRow
                    icon={HardHat}
                    label={`Infrastructure surcharge (${pct(SURCHARGE_RATES.infrastructure)}%)`}
                    hindi="अवस्थापना अधिभार"
                    value={d.infraSurcharge}
                    swatch="var(--viz-2)"
                  />
                  <LedgerRow
                    icon={ShieldCheck}
                    label={`Cow protection surcharge (${pct(SURCHARGE_RATES.cowProtection)}%)`}
                    hindi="गौ संरक्षण अधिभार"
                    value={d.cowSurcharge}
                    swatch="var(--viz-2)"
                  />
                  <LedgerRow
                    icon={AlertTriangle}
                    label={`Natural calamity surcharge (${pct(SURCHARGE_RATES.naturalCalamity)}%)`}
                    hindi="प्राकृतिक आपदा अधिभार"
                    value={d.calamitySurcharge}
                    swatch="var(--viz-2)"
                  />
                  <LedgerRow
                    icon={FileSignature}
                    label="Registration fee"
                    hindi="पंजीकरण शुल्क"
                    value={d.regFee}
                    capped={d.regCapped}
                    swatch="var(--viz-3)"
                  />
                  <LedgerRow
                    icon={Globe}
                    label="CSI charges"
                    hindi="CSI पोर्टल शुल्क"
                    value={d.csi}
                    swatch="var(--viz-4)"
                  />
                </div>

                <div className="mt-1 flex items-center justify-between gap-2 border-t-2 border-ink pt-3">
                  <div>
                    <span className="font-display text-base font-extrabold text-ink">Total payable</span>
                    <span className="block text-xs text-muted">कुल देय राशि</span>
                  </div>
                  <span
                    className={`font-display text-xl font-extrabold tabular-nums ${
                      isMsme ? "text-emerald-600 dark:text-emerald-400" : "text-accent"
                    }`}
                  >
                    {inr(d.grandTotal)}
                  </span>
                </div>

                <p className="mt-3 hidden text-xs italic text-muted print:block">
                  ≈ Approximate amount. Subject to final valuation by the Sub-Registrar.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="no-print grid grid-cols-3 gap-2.5">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className={`relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgb(31_67_133/0.8)] transition hover:brightness-110 ${
                copied
                  ? "bg-gradient-to-b from-emerald-500 to-emerald-700"
                  : "bg-gradient-to-b from-brand-500 to-brand-700"
              }`}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={copied ? "c" : "n"}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={spring}
                  className="flex items-center gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
            >
              <Printer className="h-4 w-4" />
              PDF
            </motion.button>
          </motion.div>
        </div>

        {/* Applied rates (left column on desktop, after results on mobile) */}
        <motion.section
          variants={itemVariants}
          aria-label="Applied rates"
          className="no-print card print-plain p-5 sm:p-6 lg:col-start-1 lg:row-start-2"
        >
          <div className="flex items-center gap-2">
            <BadgePercent className="h-4 w-4 text-accent" />
            <p className="font-display text-sm font-bold text-ink">Rates applied</p>
            <span className="ml-auto text-xs text-muted">{category}</span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2.5">
            {appliedRates.map((r) => (
              <div key={r.label} className="rounded-2xl bg-surface-2 px-3.5 py-3">
                <dt className="text-xs text-muted">{r.label}</dt>
                <dd className="mt-0.5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={r.value}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="block font-display text-lg font-bold tabular-nums text-ink"
                    >
                      {r.value}
                    </motion.span>
                  </AnimatePresence>
                  <span className="block text-[11px] text-muted">{r.note}</span>
                </dd>
              </div>
            ))}
          </dl>
        </motion.section>
      </motion.div>

      {/* Disclaimer — shown on screen AND in the PDF */}
      <p className="mx-auto mt-6 max-w-3xl px-1 text-center text-xs leading-relaxed text-muted">
        For guidance only. All figures are approximate and subject to final valuation by the
        Sub-Registrar. Verify against the prevailing Rajasthan Stamp &amp; Registration / e-GRAS
        schedule before relying on them.
      </p>

      {/* ---------------- How it's calculated ---------------- */}
      <section aria-labelledby="how-heading" className="no-print mt-20 sm:mt-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">How it works</p>
          <h2
            id="how-heading"
            className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-4xl"
          >
            Three charges, one total
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Every figure follows the Rajasthan statutory schedule for a mortgage deed without
            possession — the same logic e-GRAS uses.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08} className="h-full">
              <div className="card card-hover group relative h-full overflow-hidden p-6">
                <span
                  aria-hidden
                  className="absolute right-5 top-3 font-display text-6xl font-extrabold leading-none text-ink/[0.06] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110"
                >
                  {i + 1}
                </span>
                <span
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                  style={{ background: s.color }}
                >
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="relative mt-5 font-display text-lg font-bold text-ink">{s.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section
        aria-labelledby="faq-heading"
        className="no-print mt-20 grid gap-8 sm:mt-24 lg:grid-cols-[1fr_1.6fr] lg:gap-12"
      >
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">FAQ</p>
          <h2
            id="faq-heading"
            className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-4xl"
          >
            Rajasthan stamp duty &amp; registration, answered
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            This calculator estimates statutory dues on a mortgage or loan deed registered in
            Rajasthan — stamp duty, the Infrastructure, Cow Protection &amp; Natural Calamity
            surcharges, registration fee, and CSI portal charge.
          </p>
          <Link
            to="/blog"
            className="group mt-6 flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-2"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">Read the guides</span>
              <span className="block text-xs text-muted">MSME concession, e-GRAS payment, documents…</span>
            </span>
            <ArrowRight className="h-4 w-4 text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ink" />
          </Link>
        </Reveal>
        <Reveal delay={0.08}>
          <FaqAccordion items={FAQ_ITEMS} />
        </Reveal>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Trust strip */}
      <Reveal className="no-print mt-16">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-muted">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified against an e-GRAS receipt
          </span>
          <span className="inline-flex items-center gap-2">
            <Landmark className="h-4 w-4 text-accent" /> Rajasthan statutory schedule 2026
          </span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" /> Free · no sign-up · works offline
          </span>
        </div>
      </Reveal>

      {/* ---------------- Mobile floating total ---------------- */}
      <AnimatePresence>
        {!totalInView && loanAmount > 0 && (
          <motion.div
            initial={{ y: 96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="no-print fixed inset-x-3 bottom-3 z-40 lg:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <button
              type="button"
              onClick={() => totalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="glass flex w-full items-center justify-between gap-3 rounded-2xl border border-line-strong px-4 py-3 text-left shadow-[0_18px_40px_-12px_hsl(var(--shadow-color)/0.45)]"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted">Total payable · {category}</p>
                <AnimatedAmount
                  value={d.grandTotal}
                  className="font-display text-xl font-extrabold tabular-nums text-ink"
                />
              </div>
              <span
                className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-white ${
                  isMsme ? "bg-emerald-600" : "bg-brand-600"
                }`}
              >
                <Receipt className="h-3.5 w-3.5" /> Details
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
