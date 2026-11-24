import type { Base, DutyInputs, DutyResult, InputField, Instrument, Rule } from "./types.ts";
import {
  COUNT_UNIT_LABEL,
  PARTY_CATEGORIES,
  SITE_INSPECTION_FEE_DEFAULT,
  SURCHARGE,
  TELESCOPIC_BANDS,
  categoryRate,
  inspectionStatus,
} from "./constants.ts";

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export const rupees = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

const pctText = (r: number) => `${Number(r.toFixed(4))}%`;

/* ------------------------------------------------------------------ */
/* Telescopic lease rate (Article 33)                                  */
/* ------------------------------------------------------------------ */

export function leaseYears(months: number) {
  return Math.max(1, Math.ceil(Math.max(0, months) / 12));
}

/** Average of the per-year factors across the lease term, in % of value. */
export function telescopicRate(years: number): { rate: number; working: string } {
  const y = Math.min(30, Math.max(1, Math.round(years)));
  const parts: string[] = [];
  let sum = 0;
  for (const b of TELESCOPIC_BANDS) {
    const n = Math.max(0, Math.min(y, b.to) - b.from + 1);
    if (n > 0) {
      sum += n * b.factor;
      parts.push(`${n}×${b.factor}`);
    }
  }
  const rate = sum / y;
  return {
    rate,
    working: y === 1 ? `1-year rate ${pctText(rate)}` : `(${parts.join(" + ")}) / ${y} = ${pctText(rate)}`,
  };
}

/* ------------------------------------------------------------------ */
/* Inputs each instrument needs                                        */
/* ------------------------------------------------------------------ */

export type FieldSpec = {
  field: InputField;
  label: string;
  help?: string;
  kind: "money" | "percent" | "months" | "count";
};

function walk(rule: Rule | undefined, fn: (r: Rule) => void) {
  if (!rule) return;
  fn(rule);
  if (rule.t === "sum") rule.parts.forEach((p) => walk(p, fn));
}

function rulesOf(ins: Instrument) {
  return [ins.sd, ins.rf, ins.sdOrig, ins.rfOrig].filter(Boolean) as Rule[];
}

/** Label of the single generic amount an instrument asks for, if any. */
export function amountLabel(ins: Instrument): string | null {
  let label: string | null = null;
  for (const r of rulesOf(ins))
    walk(r, (x) => {
      if (!label && "base" in x && x.base.startsWith("amount:")) label = x.base.slice(7);
    });
  return label;
}

/** Whether this instrument's buyer category changes the duty. */
export function usesCategory(ins: Instrument) {
  let uses = false;
  walk(ins.sd, (x) => {
    if ((x.t === "pct" || x.t === "diff") && x.cat) uses = true;
  });
  return uses;
}

export function fieldsFor(ins: Instrument): FieldSpec[] {
  const want = new Set<InputField>();
  let countUnit: string | null = null;
  let tele = false;
  for (const r of rulesOf(ins))
    walk(r, (x) => {
      if (x.t === "tele") tele = true;
      if (x.t === "ofOrigSd") want.add("originalSd");
      if (x.t === "diff") want.add("sdPaid");
      if (x.t === "cashSlab") want.add("cash");
      if (x.t === "fixed" && x.each) countUnit = x.each;
      if (!("base" in x)) return;
      const b: Base = x.base;
      if (b === "value" || b === "highest2") {
        want.add("marketValue");
        want.add("consideration");
      } else if (b === "marketValue") want.add("marketValue");
      else if (b === "consideration" || b === "cons100") want.add("consideration");
      else if (b === "agri3" || b === "agri4") want.add("agriValue");
      else if (b === "share" || b === "exShare") {
        want.add("marketValue");
        want.add("sharePercent");
      } else if (b === "highest") {
        want.add("sharesMarketValue");
        want.add("sharesFaceValue");
        want.add("consideration");
      } else if (b === "cash") want.add("cash");
      else if (b === "cashPlusProperty") {
        want.add("cash");
        want.add("marketValue");
      } else if (b.startsWith("amount:")) want.add("amount");
    });

  const label = amountLabel(ins);
  const isShare = rulesOf(ins).some((r) => {
    let s = false;
    walk(r, (x) => {
      if ("base" in x && (x.base === "share" || x.base === "exShare")) s = true;
    });
    return s;
  });

  const specs: FieldSpec[] = [];
  if (want.has("amount"))
    specs.push({ field: "amount", label: label ?? "Amount", kind: "money" });
  if (want.has("marketValue"))
    specs.push({
      field: "marketValue",
      label: isShare ? "Market value of the property" : "Market value (as per DLC rate)",
      help: want.has("consideration") && !isShare ? "Duty is charged on the higher of market value and consideration." : undefined,
      kind: "money",
    });
  if (want.has("consideration"))
    specs.push({ field: "consideration", label: "Consideration / price in the deed", kind: "money" });
  if (want.has("agriValue"))
    specs.push({
      field: "agriValue",
      label: "Value at DLC agricultural-land rate",
      help: "Area × DLC agricultural rate of that (or the adjoining) area.",
      kind: "money",
    });
  if (want.has("sharesMarketValue"))
    specs.push({ field: "sharesMarketValue", label: "Market value of shares issued / allotted", kind: "money" });
  if (want.has("sharesFaceValue"))
    specs.push({ field: "sharesFaceValue", label: "Face value of those shares", kind: "money" });
  if (want.has("cash"))
    specs.push({ field: "cash", label: "Share contribution brought in cash", kind: "money" });
  if (want.has("sharePercent"))
    specs.push({ field: "sharePercent", label: "Partner's share in the firm / LLP", kind: "percent" });
  if (tele)
    specs.push({
      field: "leaseMonths",
      label: "Lease / licence period",
      help: "Any part of a year counts as a full year.",
      kind: "months",
    });
  if (want.has("originalSd"))
    specs.push({ field: "originalSd", label: "Stamp duty paid on the original lease", kind: "money" });
  if (want.has("sdPaid"))
    specs.push({ field: "sdPaid", label: "Stamp duty already paid", help: "On the earlier agreement / mortgage / further charges.", kind: "money" });
  if (countUnit)
    specs.push({ field: "count", label: COUNT_UNIT_LABEL[countUnit] ?? "Quantity", kind: "count" });
  return specs;
}

/* ------------------------------------------------------------------ */
/* Evaluation                                                          */
/* ------------------------------------------------------------------ */

function baseAmount(base: Base, i: DutyInputs): { amount: number; text: string } {
  const mv = i.marketValue;
  const c = i.consideration;
  switch (base) {
    case "value":
    case "highest2": {
      const v = Math.max(mv, c);
      const which = c > mv ? "consideration" : "market value";
      return { amount: v, text: `${rupees(v)} (${mv && c ? `higher of market value & consideration: ${which}` : which})` };
    }
    case "marketValue":
      return { amount: mv, text: `${rupees(mv)} market value` };
    case "consideration":
      return { amount: c, text: `${rupees(c)} consideration` };
    case "cons100": {
      const v = Math.max(c, 100);
      return { amount: v, text: `${rupees(v)} (consideration, minimum Rs. 100)` };
    }
    case "agri3":
      return { amount: 3 * i.agriValue, text: `${rupees(3 * i.agriValue)} (3 × agricultural-rate value)` };
    case "agri4":
      return { amount: 4 * i.agriValue, text: `${rupees(4 * i.agriValue)} (4 × agricultural-rate value)` };
    case "share": {
      const v = (mv * clampPct(i.sharePercent)) / 100;
      return { amount: v, text: `${rupees(v)} (${clampPct(i.sharePercent)}% share of ${rupees(mv)})` };
    }
    case "exShare": {
      const v = (mv * (100 - clampPct(i.sharePercent))) / 100;
      return { amount: v, text: `${rupees(v)} (${rupees(mv)} excluding the partner's ${clampPct(i.sharePercent)}% share)` };
    }
    case "highest": {
      const v = Math.max(i.sharesMarketValue, i.sharesFaceValue, c);
      return { amount: v, text: `${rupees(v)} (highest of share market value, face value and consideration)` };
    }
    case "cash":
      return { amount: i.cash, text: `${rupees(i.cash)} cash contribution` };
    case "cashPlusProperty": {
      const v = i.cash + mv;
      return { amount: v, text: `${rupees(v)} (cash + property)` };
    }
    default:
      return { amount: i.amount, text: `${rupees(i.amount)} ${base.slice(7).toLowerCase()}` };
  }
}

const clampPct = (p: number) => Math.min(100, Math.max(0, p || 0));

type Eval = { amount: number; working: string; adValorem: boolean; value: number };

function evalRule(rule: Rule, i: DutyInputs, ctx: { sd: number; applyCategory: boolean }): Eval {
  switch (rule.t) {
    case "nil":
      return { amount: 0, working: rule.note ? `Nil, subject to: ${rule.note}` : "Nil", adValorem: false, value: 0 };
    case "manual":
      return { amount: 0, working: rule.note, adValorem: false, value: 0 };
    case "fixed": {
      if (rule.each) {
        const n = Math.max(1, Math.floor(i.count || 1));
        const raw = rule.amt * n;
        const amount = rule.max !== undefined ? Math.min(raw, rule.max) : raw;
        return {
          amount,
          working: `${rupees(rule.amt)} × ${n}${rule.max !== undefined && raw > rule.max ? `, capped at ${rupees(rule.max)}` : ""}`,
          adValorem: false,
          value: 0,
        };
      }
      return { amount: rule.amt, working: `Fixed ${rupees(rule.amt)}`, adValorem: false, value: 0 };
    }
    case "pct":
    case "diff": {
      const { amount: base, text } = baseAmount(rule.base, i);
      const rate = rule.cat && ctx.applyCategory ? categoryRate(i.category) : rule.rate;
      let amount = (base * rate) / 100;
      let working = `${pctText(rate)} of ${text}`;
      if (rule.cat && ctx.applyCategory && rate !== rule.rate) {
        const cat = PARTY_CATEGORIES.find((c) => c.id === i.category);
        working = `${pctText(rate)} (${cat?.short} rate) of ${text}`;
      }
      if (rule.t === "pct") {
        if (base > 0 && rule.min !== undefined && amount < rule.min) {
          amount = rule.min;
          working += `, minimum ${rupees(rule.min)}`;
        }
        if (rule.max !== undefined && amount > rule.max) {
          amount = rule.max;
          working += `, capped at ${rupees(rule.max)}`;
        }
      } else {
        const paid = Math.max(0, i.sdPaid);
        amount = Math.max(0, amount - paid);
        working += ` − ${rupees(paid)} already paid`;
      }
      return { amount, working, adValorem: true, value: base };
    }
    case "tele": {
      const { amount: base, text } = baseAmount(rule.base, i);
      const years = leaseYears(i.leaseMonths);
      const t = telescopicRate(years);
      return {
        amount: (base * t.rate) / 100,
        working: `Telescopic rate for ${years} yr: ${t.working} of ${text}`,
        adValorem: true,
        value: base,
      };
    }
    case "ofSd":
      return {
        amount: ctx.sd * rule.rate,
        working: `${Math.round(rule.rate * 100)}% of stamp duty ${rupees(ctx.sd)}`,
        adValorem: true,
        value: 0,
      };
    case "ofOrigSd": {
      const o = Math.max(0, i.originalSd);
      return {
        amount: o * rule.rate,
        working: `${Math.round(rule.rate * 100)}% of ${rupees(o)} paid on the original lease`,
        adValorem: true,
        value: 0,
      };
    }
    case "cashSlab": {
      const cash = Math.max(0, i.cash);
      const slabs = Math.max(1, Math.ceil(cash / rule.slab));
      const amount = Math.min(rule.max, slabs * rule.per);
      return {
        amount,
        working: `${rupees(rule.per)} × ${slabs} slab(s) of ${rupees(rule.slab)}${slabs * rule.per > rule.max ? `, capped at ${rupees(rule.max)}` : ""}`,
        adValorem: true,
        value: cash,
      };
    }
    case "sum": {
      const parts = rule.parts.map((p) => evalRule(p, i, ctx));
      return {
        amount: parts.reduce((s, p) => s + p.amount, 0),
        working: parts.map((p) => p.working).join("  +  "),
        adValorem: parts.some((p) => p.adValorem),
        value: parts.reduce((s, p) => s + p.value, 0),
      };
    }
  }
}

/* ---------- value / period limits written into instrument names ---------- */

const LAC = 1_00_000;
function valueLimit(ins: Instrument): { max?: number; min?: number } {
  const t = `${ins.group ?? ""} ${ins.name}`.toLowerCase();
  const n = (s: string) => {
    const words: Record<string, number> = { "twenty five": 25 };
    const w = Object.keys(words).find((k) => s.includes(k));
    return (w ? words[w] : Number(s.replace(/[^\d.]/g, ""))) * LAC;
  };
  let m = t.match(/(?:upto|up to)\s+(?:the value of\s+)?(?:rs\.?\s*)?([\d.]+|twenty five)\s*(?:lac|lacs|lakh)/);
  if (m) return { max: n(m[1]) };
  m = t.match(/(?:above|exceeding|more than)\s+(?:the value of\s+)?(?:rs\.?\s*)?([\d.]+|twenty five)\s*(?:lac|lacs|lakh)/);
  if (m) return { min: n(m[1]) };
  return {};
}

/* ------------------------------------------------------------------ */
/* Main entry point                                                    */
/* ------------------------------------------------------------------ */

const round = (n: number) => Math.round(n);

function surchargeFor(sd: number, value: number, adValorem: boolean) {
  const slab = !adValorem || value <= SURCHARGE.threshold ? SURCHARGE.low : SURCHARGE.high;
  const infrastructure = round(sd * slab.infrastructure);
  const cow = round(sd * slab.cow);
  const calamity = round(sd * slab.calamity);
  return {
    rate: (slab === SURCHARGE.low ? 0.3 : 0.33) as 0.3 | 0.33,
    infrastructure,
    cow,
    calamity,
    total: infrastructure + cow + calamity,
  };
}

export function computeDuty(ins: Instrument, i: DutyInputs): DutyResult {
  // Stamp duty after rebate (buyer category applied) and before rebate (general rate).
  const sdEval = evalRule(ins.sd, i, { sd: 0, applyCategory: true });
  const sd = round(sdEval.amount);
  const sdOrigEval = evalRule(ins.sdOrig ?? ins.sd, i, { sd: 0, applyCategory: false });
  const sdBeforeRebate = Math.max(sd, round(sdOrigEval.amount));

  // The assessed value: what the duty is charged on (else what the fee is charged on).
  const rfProbe = evalRule(ins.rf, i, { sd, applyCategory: false });
  const value = sdEval.value || sdOrigEval.value || rfProbe.value;
  const adValorem = sdEval.adValorem || (ins.sd.t === "nil" ? false : sdOrigEval.adValorem);

  const s = surchargeFor(sd, value, adValorem);
  const sOrig = surchargeFor(sdBeforeRebate, value, sdOrigEval.adValorem || adValorem);

  const rfEval = rfProbe;
  const rf = round(rfEval.amount);
  const rfOrigEval = evalRule(ins.rfOrig ?? ins.rf, i, { sd: sdBeforeRebate, applyCategory: false });
  const rfBeforeRebate = Math.max(rf, round(rfOrigEval.amount));

  const csi = ins.csi;
  const inspection = ins.insp && value > 0 ? inspectionStatus(value) : null;
  const inspectionFee =
    inspection && inspection !== "Not required" ? Math.max(0, i.inspectionFee ?? SITE_INSPECTION_FEE_DEFAULT) : 0;
  const total = sd + s.total + rf + csi + inspectionFee;
  const totalBeforeRebate = sdBeforeRebate + sOrig.total + rfBeforeRebate + csi + inspectionFee;

  /* ---- conditions & warnings ---- */
  const conditions: string[] = [];
  const warnings: string[] = [];
  walk(ins.sd, (x) => {
    if (x.t === "nil" && x.note) conditions.push(`Concession requires: ${x.note}.`);
  });
  const cat = PARTY_CATEGORIES.find((c) => c.id === i.category);
  const catApplies = usesCategory(ins);
  if (catApplies && cat?.needsCertificate)
    conditions.push("Stamp duty is remitted only on submission of the certificate of identity.");
  if (catApplies && (i.category === "disabled40" || i.category === "disabled80"))
    conditions.push("A valid disability certificate must be produced.");
  if (catApplies && i.category === "femaleReserved")
    conditions.push("Caste / BPL certificate of the woman buyer must be produced.");
  ins.notes?.forEach((n) => conditions.push(n));

  const lim = valueLimit(ins);
  if (value > 0 && lim.max !== undefined && value > lim.max)
    warnings.push(`This option is only for values up to ${rupees(lim.max)}. Choose the matching option for higher values.`);
  if (value > 0 && lim.min !== undefined && value <= lim.min)
    warnings.push(`This option applies only above ${rupees(lim.min)}. Choose the matching option for lower values.`);

  let hasTele = false;
  walk(ins.sd, (x) => {
    if (x.t === "tele") hasTele = true;
  });
  if (ins.sdOrig) walk(ins.sdOrig, (x) => { if (x.t === "tele") hasTele = true; });
  if (hasTele && i.leaseMonths > 360)
    warnings.push("Leases over 30 years are charged at 6% — choose the “exceeding 30 years / perpetual” option.");
  if (hasTele && i.leaseMonths <= 0) warnings.push("Enter the lease period to apply the telescopic rate.");

  return {
    value,
    sd,
    sdBeforeRebate,
    surchargeRate: s.rate,
    surcharges: { infrastructure: s.infrastructure, cow: s.cow, calamity: s.calamity, total: s.total },
    rf,
    rfBeforeRebate,
    csi,
    inspectionFee,
    total,
    totalBeforeRebate,
    sdWorking: sdEval.working,
    rfWorking: rfEval.working,
    conditions,
    warnings,
    inspection,
    categoryRate: catApplies ? categoryRate(i.category) : null,
  };
}

export const EMPTY_INPUTS: DutyInputs = {
  marketValue: 0,
  consideration: 0,
  amount: 0,
  agriValue: 0,
  sharePercent: 0,
  cash: 0,
  sharesMarketValue: 0,
  sharesFaceValue: 0,
  leaseMonths: 0,
  originalSd: 0,
  sdPaid: 0,
  count: 1,
  category: "male",
  inspectionFee: null,
};
