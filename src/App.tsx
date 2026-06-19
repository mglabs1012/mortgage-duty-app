import { useState } from "react";
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
} from "lucide-react";

// ============================================================
//  CONFIG — edit these if your SRO / document type differs.
//  VERIFIED against the Rajasthan e-GRAS Self Valuation Report
//  dated 18-06-2026, SRO AJMER-II, "Mortgage deed without
//  possession" (Urban): Applicable Value Rs.14,25,000 ->
//  SD 3,563 + Surcharge 1,175 + RF 7,125 + CSI 500 = Rs.12,363.
// ============================================================
const CSI_CHARGE = 500; // CSI portal charge for mortgage deeds (per e-GRAS receipt)
const CSI_MIN_LOAN = 50000; // CSI applies only when loan amount exceeds this

// Surcharges are charged on the Stamp Duty, each ROUNDED individually
// before summing — this is what makes totals match the e-GRAS portal.
const SURCHARGE_RATES = {
  infrastructure: 0.13, // Infrastructure Development Surcharge
  cowProtection: 0.1, // Cow Protection Surcharge
  naturalCalamity: 0.1, // Natural Calamity Surcharge
};

// ---- Indian currency formatter (₹50,00,000 style) ----
const inr = (n: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(isFinite(n) ? n : 0);

const grouped = (digits: string): string =>
  digits ? new Intl.NumberFormat("en-IN").format(Number(digits)) : "";

const pct = (rate: number) => Math.round(rate * 100);

type LedgerRowProps = {
  icon: React.ElementType;
  label: string;
  hindi: string;
  value: number;
  capped?: boolean;
};

function LedgerRow({ icon: Icon, label, hindi, value, capped }: LedgerRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
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
                Max Cap
              </span>
            )}
          </div>
          <span className="block font-inter text-xs text-slate-400">{hindi}</span>
        </div>
      </div>
      <span className="shrink-0 font-poppins text-sm font-bold tabular-nums text-slate-900 sm:text-base">
        {inr(value)}
      </span>
    </div>
  );
}

export default function App() {
  const [raw, setRaw] = useState<string>("");
  const [category, setCategory] = useState<"Standard" | "MSME">("Standard");
  const [copied, setCopied] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(true);

  const loanAmount = Number(raw || 0);
  const isMsme = category === "MSME";

  // ---- Statutory engine (Rajasthan 2026, e-GRAS aligned) ----
  const stampRate = isMsme ? 0.00125 : 0.0025; // 0.125% vs 0.25%
  const stampCap = isMsme ? 1000000 : 1500000; // ₹10L vs ₹15L
  const rawStamp = loanAmount * stampRate;
  const stampCapped = rawStamp > stampCap;
  const stampDuty = Math.round(Math.min(rawStamp, stampCap));

  const infraSurcharge = Math.round(stampDuty * SURCHARGE_RATES.infrastructure);
  const cowSurcharge = Math.round(stampDuty * SURCHARGE_RATES.cowProtection);
  const calamitySurcharge = Math.round(stampDuty * SURCHARGE_RATES.naturalCalamity);

  const regCap = 100000; // ₹1L
  const rawReg = loanAmount * 0.005; // 0.5%
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

  // Deep-navy hero gradient; emerald variant for MSME
  const totalGrad = isMsme
    ? "from-emerald-700 via-teal-800 to-slate-900"
    : "from-indigo-700 via-blue-800 to-slate-900";
  const accentText = isMsme ? "text-emerald-700" : "text-blue-700";
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
      `TOTAL PAYABLE: ${inr(grandTotal)}`,
      ``,
      `Matches Rajasthan e-GRAS calculation (for guidance).`,
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
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({
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
    "flex items-center justify-center gap-2 rounded-2xl py-3.5 font-inter text-sm font-bold transition active:scale-95";

  return (
    <div
      id="app-bg"
      className="font-inter min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100 px-4 py-6 sm:px-6 sm:py-8"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-poppins { font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; }
        @media print {
          .no-print { display: none !important; }
          .breakdown-rows { display: block !important; }
          #app-bg { background: #ffffff !important; padding: 0 !important; }
          #receipt { box-shadow: none !important; border: 1px solid #e2e8f0; }
          @page { margin: 14mm; }
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-md flex-col gap-5 lg:max-w-4xl">
        {/* Header */}
        <header className="no-print flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg">
              <Stamp className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-poppins text-lg font-extrabold leading-tight text-slate-900 sm:text-xl">
                Mortgage &amp; Loan Duty
              </h1>
              <p className="font-inter text-xs text-slate-500 sm:text-sm">
                Rajasthan Statutory Calculator
              </p>
            </div>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 font-inter text-xs font-semibold text-white">
            2026
          </span>
        </header>

        {/* Responsive layout: control column + results column on lg */}
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          {/* LEFT — controls */}
          <div className="flex flex-col gap-5">
            <section className="no-print rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200/70 sm:p-6">
              <label className="mb-2 block font-inter text-sm font-semibold text-slate-600">
                Loan Amount{" "}
                <span className="font-normal text-slate-400">ऋण राशि</span>
              </label>

              <div className="relative flex items-center rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 transition focus-within:ring-2 focus-within:ring-blue-500">
                <IndianRupee className="mr-2 h-6 w-6 shrink-0 text-slate-400" />
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
                    className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200 transition hover:bg-red-100 active:scale-95"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Quick presets */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.v}
                    onClick={() => setRaw(p.v)}
                    className="font-inter rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-95 sm:text-sm"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Segmented control */}
              <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
                <button
                  onClick={() => setCategory("Standard")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 font-inter text-sm font-bold transition ${
                    !isMsme ? "bg-white text-blue-700 shadow" : "text-slate-500"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span className="flex flex-col items-center leading-none">
                    Standard
                    <span className="mt-0.5 text-xs font-normal opacity-70">
                      मानक · 0.25%
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => setCategory("MSME")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 font-inter text-sm font-bold transition ${
                    isMsme
                      ? "bg-white text-emerald-700 shadow"
                      : "text-slate-500"
                  }`}
                >
                  <Factory className="h-4 w-4" />
                  <span className="flex flex-col items-center leading-none">
                    MSME
                    <span className="mt-0.5 text-xs font-normal opacity-70">
                      रियायत · 0.125%
                    </span>
                  </span>
                </button>
              </div>
            </section>

            {/* Desktop-only helper card to balance the column */}
            <div className="no-print hidden rounded-3xl bg-white/60 p-5 ring-1 ring-slate-200/70 lg:block">
              <p className="font-poppins text-sm font-bold text-slate-700">
                How it&apos;s calculated
              </p>
              <p className="mt-2 font-inter text-xs leading-relaxed text-slate-500">
                Mirrors the Rajasthan e-GRAS Self Valuation Report — Stamp Duty
                0.25% (0.125% for MSME) with cap, three surcharges
                (13% + 10% + 10%) on the stamp duty each rounded individually,
                Registration Fee 0.5% with cap, plus the CSI portal charge.
              </p>
            </div>
          </div>

          {/* RIGHT — results */}
          <div className="flex flex-col gap-5">
            {/* Total hero */}
            <div
              className={`no-print overflow-hidden rounded-3xl bg-gradient-to-br ${totalGrad} p-6 text-center shadow-2xl sm:p-7`}
            >
              <p className="font-inter text-xs font-bold uppercase tracking-widest text-white/70">
                Total Payable
              </p>
              <p className="font-inter text-sm text-white/60">कुल देय राशि</p>
              <div className="flex h-16 items-center justify-center sm:h-20">
                <p className="font-poppins whitespace-nowrap text-4xl font-extrabold tabular-nums text-white sm:text-5xl">
                  {inr(grandTotal)}
                </p>
              </div>
              <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">
                <span className="font-inter text-xs text-white/80">
                  {category} · {inr(loanAmount)}
                </span>
              </div>
            </div>

            {/* Breakdown (this is what prints) */}
            <div
              id="receipt"
              className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200/70 sm:p-6"
            >
              {/* Print-only title */}
              <div className="mb-2 hidden font-poppins text-base font-bold text-slate-900 print:block">
                Rajasthan Mortgage &amp; Loan Duty — Statutory Receipt
              </div>

              {/* Collapsible header */}
              <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <Receipt className={`h-4 w-4 ${accentText}`} />
                  <span className="font-poppins text-sm font-bold text-slate-800">
                    Statutory Breakdown
                  </span>
                  <span className="hidden font-inter text-xs text-slate-400 sm:inline">
                    शुल्क विवरण
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

              {/* Context line */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1 font-inter text-xs text-slate-400">
                <span>
                  {category} category · Loan {inr(loanAmount)}
                </span>
                <span>{today}</span>
              </div>
              <div className="font-inter text-xs text-slate-400">
                Basis: Mortgage deed without possession · e-GRAS
              </div>

              {/* Collapsible rows (always shown when printing) */}
              <div className={`breakdown-rows mt-2 ${open ? "" : "hidden"}`}>
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

              {/* TOTAL PAYABLE — always visible */}
              <div className="mt-1 flex items-center justify-between gap-2 border-t-2 border-slate-900 py-4">
                <div>
                  <span className="font-poppins text-base font-extrabold text-slate-900">
                    TOTAL PAYABLE
                  </span>
                  <span className="block font-inter text-xs text-slate-400">
                    कुल देय राशि
                  </span>
                </div>
                <span
                  className={`font-poppins text-2xl font-extrabold tabular-nums ${accentText}`}
                >
                  {inr(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="no-print grid grid-cols-3 gap-2 sm:gap-3">
          <button
            onClick={handleCopy}
            className={`${actionBase} bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-lg hover:from-indigo-700 hover:to-blue-800`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleShare}
            className={`${actionBase} bg-white text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-slate-50`}
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={handlePrint}
            className={`${actionBase} bg-white text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-slate-50`}
          >
            <Printer className="h-4 w-4" />
            PDF
          </button>
        </div>

        <p className="no-print px-2 text-center font-inter text-xs leading-relaxed text-slate-400">
          For guidance only. Verify against the prevailing Rajasthan Stamp &amp;
          Registration / e-GRAS schedule before relying on figures.
        </p>
      </div>
    </div>
  );
}
