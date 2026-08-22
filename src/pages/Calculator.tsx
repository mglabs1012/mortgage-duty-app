import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  IndianRupee,
  Building2,
  Factory,
  Stamp,
  HardHat,
  FileSignature,
  Globe,
  AlertTriangle,
  Receipt,
  X,
  Share2,
  Printer,
  ShieldCheck,
  ChevronDown,
  Copy,
  Check,
  BookOpen,
} from "lucide-react";
import { BrandMark } from "../components/BrandMark";
import { FaqAccordion } from "../components/FaqAccordion";
import { AnimatedAmount } from "../components/AnimatedAmount";
import { InstallAppButton } from "../components/InstallAppButton";
import { SiteFooter } from "../components/SiteFooter";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import {
  CSI_CHARGE,
  CSI_MIN_LOAN,
  SURCHARGE_RATES,
  STAMP_RATE,
  STAMP_CAP,
  REG_RATE,
  REG_CAP,
  inr,
  grouped,
  pct,
  FAQ_ITEMS,
  faqSchema,
} from "../lib/stampDuty";

type LedgerRowProps = {
  icon: React.ElementType;
  label: string;
  hindi: string;
  value: number;
  capped?: boolean;
};

function LedgerRow({ icon: Icon, label, hindi, value, capped }: LedgerRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 py-2.5 last:border-b-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-inter text-sm font-semibold text-slate-700">
              {label}
            </span>
            {capped && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                <AlertTriangle className="h-3 w-3" />
                Cap
              </span>
            )}
          </div>
          <span className="block font-inter text-xs text-slate-400">{hindi}</span>
        </div>
      </div>
      <span className="shrink-0 font-poppins text-sm font-bold tabular-nums text-slate-900">
        {inr(value)}
      </span>
    </div>
  );
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 420, damping: 34 },
  },
};

export default function Calculator() {
  useDocumentMeta({
    title: "Rajasthan Stamp Duty Calculator 2026 | Mortgage & Loan Duty",
    description:
      "Free Rajasthan stamp duty calculator for mortgage & loan deeds. Instantly compute stamp duty, infrastructure/cow protection/natural calamity surcharges, registration fee & CSI charges for 2026, e-GRAS aligned.",
    path: "/",
  });

  const [raw, setRaw] = useState<string>("");
  const [category, setCategory] = useState<"Standard" | "MSME">("Standard");
  const [copied, setCopied] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false); // breakdown collapsed by default

  const loanAmount = Number(raw || 0);
  const isMsme = category === "MSME";

  // ---- Statutory engine (Rajasthan 2026, e-GRAS aligned) ----
  const stampRate = isMsme ? STAMP_RATE.msme : STAMP_RATE.standard;
  const stampCap = isMsme ? STAMP_CAP.msme : STAMP_CAP.standard;
  const rawStamp = loanAmount * stampRate;
  const stampCapped = rawStamp > stampCap;
  const stampDuty = Math.round(Math.min(rawStamp, stampCap));

  const infraSurcharge = Math.round(stampDuty * SURCHARGE_RATES.infrastructure);
  const cowSurcharge = Math.round(stampDuty * SURCHARGE_RATES.cowProtection);
  const calamitySurcharge = Math.round(stampDuty * SURCHARGE_RATES.naturalCalamity);

  const regCap = REG_CAP;
  const rawReg = loanAmount * REG_RATE;
  const regCapped = rawReg > regCap;
  const regFee = Math.round(Math.min(rawReg, regCap));

  const csi = loanAmount > CSI_MIN_LOAN ? CSI_CHARGE : 0;

  const grandTotal =
    stampDuty + infraSurcharge + cowSurcharge + calamitySurcharge + regFee + csi;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 12);
    setRaw(digits);
  };

  const presets = [
    { label: "₹10L", v: "1000000" },
    { label: "₹25L", v: "2500000" },
    { label: "₹50L", v: "5000000" },
    { label: "₹1Cr", v: "10000000" },
  ];

  const totalGrad = isMsme
    ? "from-emerald-700 via-teal-800 to-slate-900"
    : "from-indigo-600 via-indigo-700 to-violet-800";
  const accentText = isMsme ? "text-emerald-700" : "text-indigo-700";
  const today = new Date().toLocaleDateString("en-IN");

  const buildSummary = () =>
    [
      `Rajasthan ${category} Mortgage & Loan Duty`,
      `Loan Amount: ${inr(loanAmount)}`,
      `Date: ${today}`,
      `------------------------------`,
      `Stamp Duty Payable: ${inr(stampDuty)}`,
      `Infrastructure Surcharge (${pct(SURCHARGE_RATES.infrastructure)}%): ${inr(infraSurcharge)}`,
      `Cow Protection Surcharge (${pct(SURCHARGE_RATES.cowProtection)}%): ${inr(cowSurcharge)}`,
      `Natural Calamity Surcharge (${pct(SURCHARGE_RATES.naturalCalamity)}%): ${inr(calamitySurcharge)}`,
      `Registration Fee: ${inr(regFee)}`,
      `CSI Charges: ${inr(csi)}`,
      `------------------------------`,
      `TOTAL PAYABLE (approx.): ${inr(grandTotal)}`,
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
        await navigator.share({
          title: "Rajasthan Mortgage & Loan Duty",
          text,
        });
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

  const handlePrint = () => window.print();

  const actionBase =
    "flex items-center justify-center gap-1.5 rounded-xl py-3 font-inter text-sm font-bold transition active:scale-95";

  const cardBase =
    "rounded-3xl bg-white/90 backdrop-blur-xl shadow-[0_2px_10px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(30,41,59,0.14)] ring-1 ring-slate-900/[0.06]";

  const surchargeTotal = infraSurcharge + cowSurcharge + calamitySurcharge;
  const regAndCsi = regFee + csi;

  const kpis = [
    { icon: Stamp, label: "Stamp Duty", value: stampDuty, tint: "from-indigo-500 to-violet-600" },
    { icon: ShieldCheck, label: "Surcharges", value: surchargeTotal, tint: "from-amber-500 to-orange-600" },
    { icon: FileSignature, label: "Reg. + CSI", value: regAndCsi, tint: "from-sky-500 to-blue-600" },
  ];

  return (
    <div
      id="app-bg"
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/60 to-blue-100 px-4 py-6 sm:px-6 lg:px-10 lg:py-10"
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .breakdown-rows { display: block !important; }
          .total-row { display: flex !important; }
          #app-bg { background: #ffffff !important; padding: 0 !important; display: block !important; min-height: 0 !important; }
          .dashboard-shell { display: block !important; }
          #receipt { box-shadow: none !important; border: 1px solid #cbd5e1 !important; border-radius: 12px; }
          @page { margin: 14mm; }
        }
      `}</style>

      {/* Ambient background — no-print, purely decorative */}
      <div
        aria-hidden
        className="no-print pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.18) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="no-print pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-indigo-300/25 blur-3xl"
      />
      <div
        aria-hidden
        className="no-print pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl"
      />
      <div
        aria-hidden
        className="no-print pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-violet-300/15 blur-3xl"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 lg:gap-6"
      >
        {/* Topbar */}
        <motion.header
          variants={itemVariants}
          className="no-print flex items-center justify-between gap-2 rounded-2xl bg-white/80 px-3.5 py-3 shadow-sm ring-1 ring-slate-900/[0.06] backdrop-blur-xl sm:px-4 lg:px-5"
        >
          <BrandMark />
          <div className="flex items-center gap-1.5">
            <InstallAppButton />
            <Link
              to="/blog"
              aria-label="Blog"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-slate-800 via-slate-900 to-black px-3 py-1.5 font-inter text-xs font-semibold text-white shadow-md shadow-indigo-950/30 transition hover:from-slate-700 hover:to-black active:scale-95"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Blog</span>
            </Link>
          </div>
        </motion.header>

        {/* Dashboard grid: input sidebar (left) + results (right) */}
        <div className="dashboard-shell grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Left column — inputs */}
          <div className="dashboard-shell flex flex-col gap-4 lg:sticky lg:top-6">
            <motion.section
              variants={itemVariants}
              className={`no-print ${cardBase} p-4 sm:p-5`}
            >
              <div className="mb-2 flex items-center justify-between">
                <label className="font-inter text-sm font-semibold text-slate-600">
                  Loan Amount <span className="font-normal text-slate-400">ऋण राशि</span>
                </label>
                <span className="rounded-full bg-slate-900 px-2.5 py-1 font-inter text-xs font-semibold text-white">
                  2026
                </span>
              </div>

              <div className="relative flex items-center rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200 transition focus-within:ring-2 focus-within:ring-indigo-500">
                <IndianRupee className="mr-1.5 h-6 w-6 shrink-0 text-slate-400" />
                <input
                  value={grouped(raw)}
                  onChange={onChange}
                  inputMode="numeric"
                  type="text"
                  placeholder="0"
                  className="font-poppins w-full bg-transparent pr-10 text-2xl font-bold tabular-nums text-slate-900 outline-none placeholder:text-slate-300 sm:text-3xl"
                />
                {raw && (
                  <button
                    onClick={() => setRaw("")}
                    aria-label="Clear amount"
                    className="absolute right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 transition hover:bg-red-100 active:scale-95"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Presets */}
              <div className="relative mt-2.5 grid grid-cols-4 gap-1.5">
                {presets.map((p) => {
                  const active = raw === p.v;
                  return (
                    <button
                      key={p.v}
                      onClick={() => setRaw(p.v)}
                      className={`relative z-10 font-inter rounded-lg py-2 text-xs font-semibold transition active:scale-95 ${
                        active ? "text-white" : "text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="presetPill"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          className="absolute inset-0 -z-10 rounded-lg bg-indigo-600 shadow-sm shadow-indigo-600/30"
                        />
                      )}
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Segmented control */}
              <div className="relative mt-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                <button
                  onClick={() => setCategory("Standard")}
                  className={`relative z-10 flex items-center justify-center gap-1.5 rounded-lg py-2.5 font-inter text-sm font-bold transition ${
                    !isMsme ? "text-white" : "text-slate-500"
                  }`}
                >
                  {!isMsme && (
                    <motion.span
                      layoutId="segPill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 shadow-md shadow-indigo-600/30"
                    />
                  )}
                  <Building2 className="h-4 w-4" />
                  Standard
                </button>
                <button
                  onClick={() => setCategory("MSME")}
                  className={`relative z-10 flex items-center justify-center gap-1.5 rounded-lg py-2.5 font-inter text-sm font-bold transition ${
                    isMsme ? "text-white" : "text-slate-500"
                  }`}
                >
                  {isMsme && (
                    <motion.span
                      layoutId="segPill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 shadow-md shadow-emerald-600/30"
                    />
                  )}
                  <Factory className="h-4 w-4" />
                  MSME
                </button>
              </div>
            </motion.section>
          </div>

          {/* Right column — results */}
          <div className="dashboard-shell flex flex-col gap-4">
            {/* Total hero */}
            <motion.div
              variants={itemVariants}
              className={`no-print relative overflow-hidden rounded-3xl bg-gradient-to-br ${totalGrad} px-5 py-5 text-center shadow-xl sm:py-6`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "22px 22px",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl"
              />
              <p className="relative font-inter text-xs font-bold uppercase tracking-widest text-white/70">
                Total Payable · कुल देय राशि
              </p>
              <div className="relative flex h-14 items-center justify-center sm:h-16">
                <AnimatedAmount
                  value={grandTotal}
                  className="font-poppins whitespace-nowrap text-4xl font-extrabold tabular-nums text-white sm:text-5xl"
                />
              </div>
              <p className="relative font-inter text-xs text-white/60">
                ≈ Approximate · {category} · <a href="https://egras.rajasthan.gov.in/" style={{ textDecoration: "underline", color: "white" }}>Verify on the E-gras</a>
              </p>
            </motion.div>

            {/* KPI stat row */}
            <motion.div variants={itemVariants} className="no-print grid grid-cols-3 gap-2 sm:gap-3">
              {kpis.map((k) => (
                <div
                  key={k.label}
                  className={`${cardBase} flex flex-col gap-2 p-3 transition hover:shadow-lg sm:p-3.5`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${k.tint} text-white shadow-sm`}
                  >
                    <k.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-inter text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      {k.label}
                    </p>
                    <p className="font-poppins truncate text-sm font-extrabold tabular-nums text-slate-900 sm:text-base">
                      {inr(k.value)}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Receipt / breakdown (prints) */}
            <motion.div variants={itemVariants} id="receipt" className={`${cardBase} p-4 sm:p-5`}>
              {/* Print-only receipt header */}
              <div className="mb-3 hidden print:block">
                <div className="font-poppins text-lg font-extrabold text-slate-900">
                  Rajasthan Mortgage &amp; Loan Duty
                </div>
                <div className="font-inter text-xs text-slate-500">
                  Statutory Fee Receipt · {category} category · {today}
                </div>
              </div>

              {/* Collapsible toggle */}
              <button
                onClick={() => setOpen(!open)}
                className="-mx-1 flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <Receipt className={`h-4 w-4 ${accentText}`} />
                  <span className="font-poppins text-sm font-bold text-slate-800">
                    Statutory Breakdown
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-inter text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                    <ShieldCheck className="h-3 w-3" />
                    e-GRAS
                  </span>
                  <ChevronDown
                    className={`no-print h-4 w-4 text-slate-400 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Collapsible body (always shown when printing) */}
              <div className={`breakdown-rows ${open ? "block" : "hidden"}`}>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-1 font-inter text-xs text-slate-400">
                  <span>
                    {category} category · Loan {inr(loanAmount)}
                  </span>
                  <span>{today}</span>
                </div>
                <div className="mb-1 font-inter text-xs text-slate-400">
                  Basis: Mortgage deed without possession · e-GRAS
                </div>

                <LedgerRow
                  icon={Stamp}
                  label="Stamp Duty Payable"
                  hindi="स्टाम्प ड्यूटी"
                  value={stampDuty}
                  capped={stampCapped}
                />
                <LedgerRow
                  icon={HardHat}
                  label={`Infrastructure Surcharge (${pct(SURCHARGE_RATES.infrastructure)}%)`}
                  hindi="अवस्थापना अधिभार"
                  value={infraSurcharge}
                />
                <LedgerRow
                  icon={ShieldCheck}
                  label={`Cow Protection Surcharge (${pct(SURCHARGE_RATES.cowProtection)}%)`}
                  hindi="गौ संरक्षण अधिभार"
                  value={cowSurcharge}
                />
                <LedgerRow
                  icon={AlertTriangle}
                  label={`Natural Calamity Surcharge (${pct(SURCHARGE_RATES.naturalCalamity)}%)`}
                  hindi="प्राकृतिक आपदा अधिभार"
                  value={calamitySurcharge}
                />
                <LedgerRow
                  icon={FileSignature}
                  label="Registration Fee"
                  hindi="पंजीकरण शुल्क"
                  value={regFee}
                  capped={regCapped}
                />
                <LedgerRow
                  icon={Globe}
                  label="CSI Charges"
                  hindi="CSI पोर्टल शुल्क"
                  value={csi}
                />
              </div>

              {/* TOTAL row — hidden on screen when collapsed, always printed */}
              <div
                className={`total-row mt-1 items-center justify-between gap-2 border-t-2 border-slate-900 py-3 ${
                  open ? "flex" : "hidden"
                }`}
              >
                <div>
                  <span className="font-poppins text-base font-extrabold text-slate-900">
                    TOTAL PAYABLE
                  </span>
                  <span className="block font-inter text-xs text-slate-400">
                    कुल देय राशि
                  </span>
                </div>
                <span
                  className={`font-poppins text-xl font-extrabold tabular-nums ${accentText}`}
                >
                  {inr(grandTotal)}
                </span>
              </div>

              {/* Approximate note directly under total — printed only */}
              <p className="hidden font-inter text-xs italic text-slate-500 print:block">
                ≈ Approximate amount. Subject to final valuation by the Sub-Registrar.
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div variants={itemVariants} className="no-print grid grid-cols-3 gap-2">
              <button
                onClick={handleCopy}
                className={`${actionBase} bg-gradient-to-r from-indigo-600 to-violet-700 text-white shadow-md shadow-indigo-600/25 hover:from-indigo-700 hover:to-violet-800`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleShare}
                className={`${actionBase} bg-indigo-50 text-indigo-700 hover:bg-indigo-100`}
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                onClick={handlePrint}
                className={`${actionBase} bg-slate-100 text-slate-700 hover:bg-slate-200`}
              >
                <Printer className="h-4 w-4" />
                PDF
              </button>
            </motion.div>
          </div>
        </div>

        {/* Disclaimer — shown on screen AND in the PDF */}
        <motion.p
          variants={itemVariants}
          className="px-1 text-center font-inter text-xs leading-relaxed text-slate-400"
        >
          For guidance only. All figures are approximate and subject to final
          valuation by the Sub-Registrar. Verify against the prevailing Rajasthan
          Stamp &amp; Registration / e-GRAS schedule before relying on them.
        </motion.p>

        {/* SEO content — real, crawlable explainer + FAQ */}
        <motion.section
          variants={itemVariants}
          aria-labelledby="faq-heading"
          className={`no-print ${cardBase} p-4 sm:p-5`}
        >
          <h2
            id="faq-heading"
            className="font-poppins text-sm font-bold text-slate-800"
          >
            Rajasthan Stamp Duty &amp; Registration — FAQs
          </h2>
          <p className="mt-1.5 font-inter text-xs leading-relaxed text-slate-500">
            This calculator estimates statutory dues on a mortgage or loan
            deed registered in Rajasthan — stamp duty, the Infrastructure,
            Cow Protection &amp; Natural Calamity surcharges, registration
            fee, and CSI portal charge — aligned with the Rajasthan e-GRAS
            calculation logic.
          </p>
          <div className="mt-2">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </motion.section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* Footer */}
        <motion.footer
          variants={itemVariants}
          className="px-1 pb-1 text-center font-inter text-xs text-slate-400"
        >
          <Link
            to="/blog"
            className="font-semibold text-indigo-600 underline decoration-indigo-200 underline-offset-2 transition hover:text-indigo-700"
          >
            Read our blog
          </Link>
          <div className="mt-1.5">
            <SiteFooter />
          </div>
        </motion.footer>
      </motion.div>
    </div>
  );
}
