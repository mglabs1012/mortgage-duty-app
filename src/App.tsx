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

const SURCHARGE_RATES = {
  infrastructure: 0.13, // Infrastructure Development Surcharge
  cowProtection: 0.1, // Cow Protection Surcharge
  naturalCalamity: 0.1, // Natural Calamity Surcharge
};

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

export default function App() {
  const [raw, setRaw] = useState<string>("");
  const [category, setCategory] = useState<"Standard" | "MSME">("Standard");
  const [copied, setCopied] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false); // breakdown collapsed by default

  const loanAmount = Number(raw || 0);
  const isMsme = category === "MSME";

  // ---- Statutory engine (Rajasthan 2026, e-GRAS aligned) ----
  const stampRate = isMsme ? 0.00125 : 0.0025;
  const stampCap = isMsme ? 1000000 : 1500000;
  const rawStamp = loanAmount * stampRate;
  const stampCapped = rawStamp > stampCap;
  const stampDuty = Math.round(Math.min(rawStamp, stampCap));

  const infraSurcharge = Math.round(stampDuty * SURCHARGE_RATES.infrastructure);
  const cowSurcharge = Math.round(stampDuty * SURCHARGE_RATES.cowProtection);
  const calamitySurcharge = Math.round(stampDuty * SURCHARGE_RATES.naturalCalamity);

  const regCap = 100000;
  const rawReg = loanAmount * 0.005;
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
    "flex items-center justify-center gap-1.5 rounded-xl py-3 font-inter text-sm font-bold transition active:scale-95";

  return (
    <div
      id="app-bg"
      className="font-inter flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100 px-4 py-6 sm:px-6"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-poppins { font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; }
        @media print {
          .no-print { display: none !important; }
          .breakdown-rows { display: block !important; }
          .total-row { display: flex !important; }
          #app-bg { background: #ffffff !important; padding: 0 !important; display: block !important; min-height: 0 !important; }
          #receipt { box-shadow: none !important; border: 1px solid #cbd5e1 !important; border-radius: 12px; }
          @page { margin: 14mm; }
        }
      `}</style>

      {/* m-auto keeps the card centred on big screens, but lets it scroll when tall */}
      <div className="m-auto flex w-full max-w-md flex-col gap-3 sm:gap-4">
        {/* Header */}
        <header className="no-print flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg">
              <Stamp className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-poppins text-base font-extrabold leading-tight text-slate-900 sm:text-lg">
                Mortgage &amp; Loan Duty
              </h1>
              <p className="font-inter text-xs text-slate-500">
                Rajasthan Statutory Calculator
              </p>
            </div>
          </div>
          <span className="rounded-full bg-slate-900 px-2.5 py-1 font-inter text-xs font-semibold text-white">
            2026
          </span>
        </header>

        {/* Input card */}
        <section className="no-print rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200/70 sm:p-5">
          <label className="mb-2 block font-inter text-sm font-semibold text-slate-600">
            Loan Amount <span className="font-normal text-slate-400">ऋण राशि</span>
          </label>

          <div className="relative flex items-center rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200 transition focus-within:ring-2 focus-within:ring-blue-500">
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
          <div className="mt-2.5 grid grid-cols-4 gap-1.5">
            {presets.map((p) => (
              <button
                key={p.v}
                onClick={() => setRaw(p.v)}
                className="font-inter rounded-lg bg-slate-100 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-95"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Segmented control */}
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setCategory("Standard")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 font-inter text-sm font-bold transition ${
                !isMsme ? "bg-white text-blue-700 shadow" : "text-slate-500"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Standard
            </button>
            <button
              onClick={() => setCategory("MSME")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 font-inter text-sm font-bold transition ${
                isMsme ? "bg-white text-emerald-700 shadow" : "text-slate-500"
              }`}
            >
              <Factory className="h-4 w-4" />
              MSME
            </button>
          </div>
        </section>

        {/* Total hero */}
        <div
          className={`no-print overflow-hidden rounded-2xl bg-gradient-to-br ${totalGrad} px-5 py-4 text-center shadow-xl`}
        >
          <p className="font-inter text-xs font-bold uppercase tracking-widest text-white/70">
            Total Payable · कुल देय राशि
          </p>
          <div className="flex h-14 items-center justify-center sm:h-16">
            <p className="font-poppins whitespace-nowrap text-4xl font-extrabold tabular-nums text-white sm:text-5xl">
              {inr(grandTotal)}
            </p>
          </div>
          <p className="font-inter text-xs text-white/60">
            ≈ Approximate · {category} · subject to final SRO valuation
          </p>
        </div>

        {/* Receipt / breakdown (prints) */}
        <div
          id="receipt"
          className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200/70 sm:p-5"
        >
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
        </div>

        {/* Actions */}
        <div className="no-print grid grid-cols-3 gap-2">
          <button
            onClick={handleCopy}
            className={`${actionBase} bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-md hover:from-indigo-700 hover:to-blue-800`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleShare}
            className={`${actionBase} bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50`}
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={handlePrint}
            className={`${actionBase} bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50`}
          >
            <Printer className="h-4 w-4" />
            PDF
          </button>
        </div>

        {/* Disclaimer — shown on screen AND in the PDF */}
        <p className="px-1 text-center font-inter text-xs leading-relaxed text-slate-400">
          For guidance only. All figures are approximate and subject to final
          valuation by the Sub-Registrar. Verify against the prevailing Rajasthan
          Stamp &amp; Registration / e-GRAS schedule before relying on them.
        </p>
      </div>
    </div>
  );
}
