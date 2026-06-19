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
} from "lucide-react";

// ---- Indian currency formatter (₹50,00,000 style) ----
const inr = (n: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(isFinite(n) ? n : 0);

// Group raw digit string with Indian separators for the input field
const grouped = (digits: string): string =>
  digits ? new Intl.NumberFormat("en-IN").format(Number(digits)) : "";

type LedgerRowProps = {
  icon: React.ElementType;
  label: string;
  hindi: string;
  value: number;
  capped?: boolean;
  last?: boolean;
};

function LedgerRow({ icon: Icon, label, hindi, value, capped, last }: LedgerRowProps) {
  return (
    <div
      className={`flex items-center justify-between py-3.5 ${
        last ? "" : "border-b border-slate-100"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
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

  const loanAmount = Number(raw || 0);
  const isMsme = category === "MSME";

  // ---- Statutory engine (Rajasthan 2026) ----
  const stampRate = isMsme ? 0.00125 : 0.0025; // 0.125% vs 0.25%
  const stampCap = isMsme ? 1000000 : 1500000; // ₹10L vs ₹15L
  const rawStamp = loanAmount * stampRate;
  const stampDuty = Math.min(rawStamp, stampCap);
  const stampCapped = rawStamp > stampCap;

  const labourCess = stampDuty * 0.2; // 20% of CAPPED stamp duty

  const regCap = 100000; // ₹1L
  const rawReg = loanAmount * 0.005; // 0.5%
  const regFee = Math.min(rawReg, regCap);
  const regCapped = rawReg > regCap;

  let csi = 0;
  if (loanAmount > 0 && loanAmount <= 50000) csi = 200;
  else if (loanAmount > 50000) csi = 300;

  const grandTotal = stampDuty + labourCess + regFee + csi;

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-indigo-50 to-slate-100 px-4 py-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
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
        <div className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
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
          className={`rounded-3xl bg-gradient-to-br ${totalGrad} p-6 text-center shadow-2xl`}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">
            Grand Total Payable
          </p>
          <p className="text-sm text-white/60">कुल देय राशि</p>
          <p className={`mt-2 font-extrabold tabular-nums text-white ${totalCls}`}>
            {totalStr}
          </p>
          <p className="mt-3 text-xs text-white/70">
            {category} category · on a loan of {inr(loanAmount)}
          </p>
        </div>

        {/* BOTTOM ZONE — Receipt Ledger */}
        <div className="rounded-3xl bg-white px-5 py-2 shadow-lg ring-1 ring-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-100 py-3">
            <Receipt className={`h-4 w-4 ${accentText}`} />
            <span className="text-sm font-bold text-slate-700">
              Statutory Breakdown
            </span>
            <span className="text-xs text-slate-400">शुल्क विवरण</span>
          </div>
          <LedgerRow
            icon={Stamp}
            label="Base Stamp Duty"
            hindi="स्टाम्प ड्यूटी"
            value={stampDuty}
            capped={stampCapped}
          />
          <LedgerRow
            icon={HardHat}
            label="Labour Cess (20%)"
            hindi="श्रम उपकर"
            value={labourCess}
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
            label="CSI Portal Charge"
            hindi="CSI पोर्टल शुल्क"
            value={csi}
            last
          />
        </div>

        <p className="px-2 text-center text-xs leading-relaxed text-slate-400">
          For guidance only. Verify against the prevailing Rajasthan Stamp &amp;
          Registration schedule before relying on figures.
        </p>
      </div>
    </div>
  );
}
