import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  ChevronDown,
  ClipboardList,
  Copy,
  FileStack,
  MessageCircle,
  MousePointerClick,
  Printer,
  Receipt,
  RotateCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { AnimatedAmount } from "../components/AnimatedAmount";
import { Reveal } from "../components/Reveal";
import { INSTRUMENTS, FEES_MASTER_DATE } from "./data/feesMaster.ts";
import { ADD_ONS, addOnTotal, byId, displayName, headMeta } from "./catalog.ts";
import { PARTY_CATEGORIES } from "./constants.ts";
import { EMPTY_INPUTS, computeDuty, fieldsFor, rupees, usesCategory } from "./engine.ts";
import type { DutyInputs, InputField } from "./types.ts";
import { DocumentPicker } from "./components/DocumentPicker";
import { CountField, MoneyField, PartyCategoryPicker, PercentField, PeriodField } from "./components/Fields";
import { ResultPanel } from "./components/ResultPanel";
import { QuoteSheet } from "./components/QuoteSheet";
import { EMPTY_QUOTE, type QuoteDetails } from "./quote.ts";

const ease = [0.22, 1, 0.36, 1] as const;
const PREPARED_BY_KEY = "rj-duty-calc:prepared-by";

function readPreparedBy() {
  try {
    return localStorage.getItem(PREPARED_BY_KEY) ?? "";
  } catch {
    return "";
  }
}

function StepTitle({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">{n}</span>
      <div>
        <h2 className="font-display text-base font-bold text-ink">{title}</h2>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}

export default function StampDutyPage() {
  useDocumentMeta({
    title: "Rajasthan Stamp Duty & Registration Fee Calculator — All Deeds",
    description:
      "Calculate Rajasthan stamp duty, surcharge, registration fee and CSI for 360+ documents — sale, gift, lease, mortgage, POA, partition, release, partnership and more — as per the IGRS Fees Master.",
    path: "/stamp-duty",
  });

  const [params, setParams] = useSearchParams();
  const selectedId = params.get("doc");
  const ins = byId(selectedId);

  const [inputs, setInputs] = useState<DutyInputs>(EMPTY_INPUTS);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [quote, setQuote] = useState<QuoteDetails>(() => ({ ...EMPTY_QUOTE, preparedBy: readPreparedBy() }));
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refNo] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `EST-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  });

  const fields = useMemo(() => (ins ? fieldsFor(ins) : []), [ins]);
  const showCategory = ins ? usesCategory(ins) : false;
  const result = useMemo(() => (ins ? computeDuty(ins, inputs) : null), [ins, inputs]);
  const grand = result ? result.total + addOnTotal(addOns) : 0;

  const pick = (id: string) => {
    setParams({ doc: id }, { replace: true });
    if (inputs.leaseMonths === 0) {
      const next = byId(id);
      if (next && fieldsFor(next).some((f) => f.field === "leaseMonths"))
        setInputs((s) => ({ ...s, leaseMonths: next.sno === 50 ? 11 : 60 }));
    }
  };
  const set = (field: InputField, v: number) => setInputs((s) => ({ ...s, [field]: v }));
  const setQ = (k: keyof QuoteDetails, v: string) => {
    setQuote((q) => ({ ...q, [k]: v }));
    if (k === "preparedBy")
      try {
        localStorage.setItem(PREPARED_BY_KEY, v);
      } catch {
        /* storage unavailable */
      }
  };
  const reset = () => {
    setInputs(EMPTY_INPUTS);
    setAddOns([]);
    setQuote((q) => ({ ...EMPTY_QUOTE, preparedBy: q.preparedBy }));
  };

  /* ---- mobile floating total ---- */
  const totalRef = useRef<HTMLDivElement>(null);
  const [totalInView, setTotalInView] = useState(true);
  useEffect(() => {
    const el = totalRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setTotalInView(e.isIntersecting), { rootMargin: "-64px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [selectedId]);

  /* ---- share / copy ---- */
  const summary = () => {
    if (!ins || !result) return "";
    const cat = PARTY_CATEGORIES.find((c) => c.id === inputs.category);
    return [
      `*Stamp duty & registration estimate*`,
      quote.client && `Client: ${quote.client}`,
      `Document: ${headMeta(ins.head).label} — ${displayName(ins)} (Art. ${ins.article || "-"})`,
      result.categoryRate !== null && cat && `Buyer category: ${cat.label}`,
      result.value > 0 && `Value: ${rupees(result.value)}`,
      ``,
      `Stamp duty: ${rupees(result.sd)}`,
      `Surcharge (${Math.round(result.surchargeRate * 100)}%): ${rupees(result.surcharges.total)}`,
      `Registration fee: ${rupees(result.rf)}`,
      `CSI: ${rupees(result.csi)}`,
      result.inspectionFee > 0 && `Site inspection fee: ${rupees(result.inspectionFee)}`,
      ...addOns.map((id) => `${ADD_ONS.find((a) => a.id === id)?.label}: ${rupees(addOnTotal([id]))}`),
      `*Total payable (approx.): ${rupees(grand)}*`,
      ``,
      `As per IGRS Rajasthan Fees Master (${FEES_MASTER_DATE}). Subject to Sub-Registrar valuation.`,
      quote.preparedBy && `— ${quote.preparedBy}`,
    ]
      .filter((l) => l !== false && l !== "" && l !== undefined)
      .join("\n")
      .replace(/\n\n+/g, "\n\n");
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };
  const whatsapp = () => {
    const phone = quote.mobile.replace(/\D/g, "");
    const to = phone.length === 10 ? `91${phone}` : phone;
    window.open(`https://wa.me/${to}?text=${encodeURIComponent(summary())}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="no-print mx-auto w-full max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        {/* ---------------- Hero ---------------- */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          className="mb-8 max-w-3xl sm:mb-10"
        >
          <motion.span
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-medium text-ink-2 shadow-sm backdrop-blur"
          >
            <span className="h-1.5 w-1.5 animate-pulse-ring rounded-full bg-emerald-500" />
            IGRS Fees Master · applicable {FEES_MASTER_DATE}
          </motion.span>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
            className="mt-5 font-display text-[2rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl"
          >
            Stamp duty &amp; registration fees, <span className="text-gradient">for every deed.</span>
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
            className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base"
          >
            Pick the document, enter the value and who it favours — get the stamp duty, surcharge, registration fee and
            CSI with every rebate applied, then hand the client a printed estimate.
          </motion.p>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted"
          >
            <span className="inline-flex items-center gap-1.5">
              <FileStack className="h-4 w-4 text-accent" /> {INSTRUMENTS.length} document types
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Rebates & concessions built in
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Printer className="h-4 w-4 text-amber-500" /> Printable client estimate
            </span>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.08fr_1fr] lg:gap-6">
          {/* ---------------- Left: steps ---------------- */}
          <div className="flex min-w-0 flex-col gap-5">
            <DocumentPicker selectedId={selectedId} onPick={pick} />

            <AnimatePresence initial={false}>
              {ins && (
                <motion.section
                  key="values"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.4, ease }}
                  className="card flex flex-col gap-6 p-5 sm:p-6"
                  aria-label="Values and parties"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StepTitle n={2} title="Values & parties" hint={ins.prop ? "Property details are required for this document." : undefined} />
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-muted hover:bg-surface-2 hover:text-ink"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </button>
                  </div>

                  {showCategory && (
                    <PartyCategoryPicker value={inputs.category} onChange={(c) => setInputs((s) => ({ ...s, category: c }))} />
                  )}

                  {result && result.inspectionFee > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">Site inspection fee</p>
                        <p className="text-xs text-muted">
                          Inspection is {result.inspection?.toLowerCase()} at this value. ₹1,000 is the usual charge; edit if
                          your office charges a different slab.
                        </p>
                      </div>
                      <div className="flex items-center rounded-xl border border-line bg-surface px-3 py-2 focus-within:border-accent/60">
                        <span className="mr-1 text-muted">₹</span>
                        <input
                          id="f-inspectionFee"
                          inputMode="numeric"
                          aria-label="Site inspection fee"
                          value={result.inspectionFee}
                          onChange={(e) =>
                            setInputs((s) => ({ ...s, inspectionFee: Number(e.target.value.replace(/\D/g, "").slice(0, 6) || 0) }))
                          }
                          className="w-20 bg-transparent font-display text-base font-bold tabular-nums text-ink outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {fields.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {fields.map((f) => {
                        const wide = f.kind === "months" || fields.length === 1 || f.field === "amount";
                        const cls = wide ? "sm:col-span-2" : "";
                        return (
                          <div key={f.field} className={cls}>
                            {f.kind === "money" && <MoneyField spec={f} value={inputs[f.field] as number} onChange={(v) => set(f.field, v)} />}
                            {f.kind === "percent" && <PercentField spec={f} value={inputs[f.field] as number} onChange={(v) => set(f.field, v)} />}
                            {f.kind === "months" && <PeriodField spec={f} months={inputs.leaseMonths} onChange={(v) => set("leaseMonths", v)} />}
                            {f.kind === "count" && <CountField spec={f} value={inputs.count} onChange={(v) => set("count", v)} />}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink-2">
                      <Check className="h-4 w-4 text-emerald-500" /> Fixed fees — no value needed for this document.
                    </p>
                  )}
                </motion.section>
              )}
            </AnimatePresence>

            {ins && (
              <section className="card p-5 sm:p-6" aria-label="Client details">
                <button
                  type="button"
                  onClick={() => setQuoteOpen((o) => !o)}
                  aria-expanded={quoteOpen}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <StepTitle n={3} title="Client details" hint="Optional — printed on the estimate" />
                  <motion.span animate={{ rotate: quoteOpen ? 180 : 0 }} className="flex text-muted">
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>
                <div className="collapsible" data-open={quoteOpen}>
                  <div>
                    <div className="grid grid-cols-1 gap-3 pt-5 sm:grid-cols-2">
                      {(
                        [
                          ["client", "Client name", "Who asked for the estimate"],
                          ["mobile", "Client mobile", "For WhatsApp sharing"],
                          ["firstParty", "First party (executant)", "Seller / donor / lessor…"],
                          ["secondParty", "Second party (claimant)", "Buyer / donee / lessee…"],
                          ["property", "Property / subject", "Address, khasra, plot no…"],
                          ["preparedBy", "Prepared by (your firm)", "Remembered on this device"],
                        ] as [keyof QuoteDetails, string, string][]
                      ).map(([k, label, ph]) => (
                        <label key={k} className={k === "property" ? "sm:col-span-2" : ""}>
                          <span className="mb-1.5 block text-xs font-semibold text-ink-2">{label}</span>
                          <input
                            value={quote[k]}
                            onChange={(e) => setQ(k, e.target.value)}
                            placeholder={ph}
                            inputMode={k === "mobile" ? "tel" : undefined}
                            className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-sm text-ink outline-none transition-all placeholder:text-muted/70 focus:border-accent/60 focus:bg-surface focus:shadow-[0_0_0_4px_var(--accent-soft)]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ---------------- Right: result ---------------- */}
          <div className="min-w-0 lg:sticky lg:top-24">
            <AnimatePresence mode="wait" initial={false}>
              {ins && result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease }}
                  className="flex flex-col gap-5"
                >
                  <ResultPanel
                    ins={ins}
                    result={result}
                    inputs={inputs}
                    addOns={addOns}
                    onToggleAddOn={(id) => setAddOns((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))}
                    onCategory={(c) => setInputs((s) => ({ ...s, category: c }))}
                    totalRef={totalRef}
                  />
                  <div className="grid grid-cols-3 gap-2.5">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.print()}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgb(31_67_133/0.8)] transition hover:brightness-110"
                    >
                      <Printer className="h-4 w-4" /> Estimate
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={whatsapp}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={copy}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card relative overflow-hidden p-6 sm:p-8"
                >
                  <div aria-hidden className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
                  <div className="relative">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                      <MousePointerClick className="h-6 w-6" />
                    </span>
                    <p className="mt-5 font-display text-xl font-extrabold text-ink">Choose a document to begin</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">The estimate appears here as you type.</p>
                    <ol className="mt-6 space-y-4">
                      {[
                        [ClipboardList, "Document", "Search or browse the 28 document types of the Fees Master."],
                        [UserRound, "Values & parties", "Market value, consideration or loan amount, plus the buyer's category."],
                        [Receipt, "Estimate", "Stamp duty + 30/33% surcharge + registration fee + CSI, ready to print or WhatsApp."],
                      ].map(([Icon, t, d], i) => {
                        const I = Icon as React.ElementType;
                        return (
                          <li key={t as string} className="flex gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
                              <I className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-ink">
                                {i + 1}. {t as string}
                              </p>
                              <p className="text-xs leading-relaxed text-muted">{d as string}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ---------------- How it adds up ---------------- */}
        <Reveal className="mt-16">
          <div className="card grid gap-6 p-6 sm:p-8 md:grid-cols-4">
            {[
              ["Stamp duty", "Rate from the Fees Master for the document, after rebates and the buyer-category concession."],
              ["Surcharge", "30% of stamp duty for values up to ₹10 lakh or fixed duty; 33% otherwise (infrastructure + cow protection + natural calamity)."],
              ["Registration fee", "Generally 1% of the value; many documents have caps, fixed fees or 20% of stamp duty (leases)."],
              ["CSI & inspection", "₹500 copying, scanning & indexing on most documents. Above ₹10 lakh, inspection-flagged documents (e.g. sale deeds) also carry a site inspection fee, usually ₹1,000."],
            ].map(([t, d], i) => (
              <div key={t}>
                <p className="font-display text-3xl font-extrabold text-ink/10">0{i + 1}</p>
                <p className="mt-1 font-display text-base font-bold text-ink">{t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-muted">
          Based on the IGRS Rajasthan Fees Master applicable on {FEES_MASTER_DATE}. For guidance only — the Rajasthan Stamp Act
          1998, Registration Act 1908, the rules and notifications in force prevail. Verify on e-GRAS before payment.
        </p>
      </div>

      {/* Print-only client estimate */}
      {ins && result && (
        <QuoteSheet ins={ins} result={result} inputs={inputs} addOns={addOns} quote={quote} refNo={refNo} />
      )}

      {/* Mobile floating total */}
      <AnimatePresence>
        {ins && result && !totalInView && grand > 0 && (
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
                <p className="truncate text-[11px] font-medium text-muted">{displayName(ins)}</p>
                <AnimatedAmount value={grand} className="font-display text-xl font-extrabold tabular-nums text-ink" />
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-600 px-3 py-2 text-xs font-semibold text-white">
                <Receipt className="h-3.5 w-3.5" /> Details
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
