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
} from "lucide-react";

// ============================================================
//  CONFIG — edit these if your SRO / document type differs.
//  Changing a value here updates the whole app; no logic edits.
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
    <div className="flex items-center justify-between border-b border-slate-100 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-4 w-4 text-slate-500" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">{label}</span>
            {capped && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                <AlertTriangle className="h-3 w-3" />
                Max Cap
              </span>
            )}
          </div>
          <span className="block text-xs text-slate-400">{hindi}</span>
        </div>
      </div>
      <span className="shrink-0 pl-2 text-base font-bold tabular-nums text-slate-900">
        {inr(value)}
      </span>
    </div>
  );
}

export default function App() {
  const [raw, setRaw] = useState<string>("");
  const [category, setCategory] = useState<"Standard" | "MSME">("Standard");
  const [copied, setCopied] = useState<boolean>(false);

  const loanAmount = Number(raw || 0);
  const isMsme = category === "MSME";

  // ---- Statutory engine (Rajasthan 2026, e-GRAS aligned) ----
  const stampRate = isMsme ? 0.00125 : 0.0025; // 0.125% vs 0.25%
  const stampCap = isMsme ? 1000000 : 1500000; // ₹10L vs ₹15L
  const rawStamp = loanAmount * stampRate;
  const stampCapped = rawStamp > stampCap;
  const stampDuty = Math.round(Math.min(rawStamp, stampCap));

  // Each surcharge rounded individually (matches portal exactly)
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

  // Scale the giant total so it never overflows
  const totalStr = inr(grandTotal);
  let totalCls = "text-6xl";
  if (totalStr.length >= 11) totalCls = "text-4xl";
  else if (totalStr.length >= 9) totalCls = "text-5xl";

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
    ? "from-emerald-600 via-emerald-700 to-teal-800"
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
      `TOTAL PAYABLE: ${inr(grandTotal)}`,
      ``,
      `Matches Rajasthan e-GRAS calculation (for guidance).`,
    ].join("\n");

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
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* user cancelled */
      }
    }
  };

  const handlePrint = () => window.print();

  return (
    <div
      id="app-bg"
      className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-indigo-50 to-slate-100 px-4 py-6"
    >
      {/* Print rules: only the receipt prints, on clean white. */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #app-bg { background: #ffffff !important; padding: 0 !important; }
          #receipt { box-shadow: none !important; border: 1px solid #e2e8f0; }
          @page { margin: 14mm; }
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        {/* Header */}
        <div className="no-print flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold leading-tight text-slate-900">
              Mortgage &amp; Loan Duty
            </h1>
            <p className="text-sm text-slate-500">Rajasthan Statutory Calculator</p>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            2026
          </span>
        </div>

        {/* TOP ZONE — Inputs */}
        <div className="no-print rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-600">
              Loan Amount{" "}
              <span className="font-normal text-slate-400">ऋण राशि</span>
            </label>
            {raw && (
              <button
                onClick={() => setRaw("")}
                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-400">
            <IndianRupee className="h-6 w-6 shrink-0 text-slate-400" />
            <input
              value={grouped(raw)}
              onChange={onChange}
              inputMode="numeric"
              type="text"
              placeholder="0"
              className="w-full bg-transparent text-3xl font-bold tabular-nums text-slate-900 outline-none placeholder:text-slate-300"
            />
          </div>

          {/* Quick presets */}
          <div className="mt-3 flex gap-2">
            {presets.map((p) => (
              <button
                key={p.v}
                onClick={() => setRaw(p.v)}
                className="flex-1 rounded-xl bg-slate-100 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Segmented control */}
          <div className="mt-4 flex gap-1 rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => setCategory("Standard")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
                !isMsme ? "bg-white text-indigo-700 shadow" : "text-slate-500"
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
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
                isMsme ? "bg-white text-emerald-700 shadow" : "text-slate-500"
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
        </div>

        {/* CENTRAL ZONE — Grand Total */}
        <div
          className={`no-print rounded-3xl bg-gradient-to-br ${totalGrad} p-6 text-center shadow-2xl`}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">
            Total Payable
          </p>
          <p className="text-sm text-white/60">कुल देय राशि</p>
          <p className={`mt-2 font-extrabold tabular-nums text-white ${totalCls}`}>
            {totalStr}
          </p>
          <p className="mt-3 text-xs text-white/70">
            {category} category · on a loan of {inr(loanAmount)}
          </p>
        </div>

        {/* BOTTOM ZONE — Receipt Ledger (this is what prints) */}
        <div
          id="receipt"
          className="rounded-3xl bg-white px-5 py-2 shadow-lg ring-1 ring-slate-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 py-3">
            <div className="flex items-center gap-2">
              <Receipt className={`h-4 w-4 ${accentText}`} />
              <span className="text-sm font-bold text-slate-700">
                Statutory Breakdown
              </span>
              <span className="text-xs text-slate-400">शुल्क विवरण</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <ShieldCheck className="h-3 w-3" />
              e-GRAS
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 pb-1 text-xs text-slate-400">
            <span>
              {category} category · Loan {inr(loanAmount)}
            </span>
            <span>{today}</span>
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

          {/* TOTAL PAYABLE row */}
          <div className="mt-1 flex items-center justify-between border-t-2 border-slate-900 py-4">
            <div>
              <span className="text-base font-extrabold text-slate-900">
                TOTAL PAYABLE
              </span>
              <span className="block text-xs text-slate-400">कुल देय राशि</span>
            </div>
            <span className={`text-2xl font-extrabold tabular-nums ${accentText}`}>
              {inr(grandTotal)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="no-print flex gap-3">
          <button
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-slate-800"
          >
            <Share2 className="h-4 w-4" />
            {copied ? "Copied!" : "Share"}
          </button>
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-bold text-slate-700 shadow-lg ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Save PDF
          </button>
        </div>

        <p className="px-2 text-center text-xs leading-relaxed text-slate-400">
          For guidance only. Verify against the prevailing Rajasthan Stamp &amp;
          Registration / e-GRAS schedule before relying on figures.
        </p>
      </div>
    </div>
  );
}
