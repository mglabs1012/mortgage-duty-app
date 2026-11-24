/**
 * What a stamp-duty or registration-fee amount is charged on.
 *  value            higher of market value (DLC) and consideration
 *  marketValue      market value of the property only
 *  consideration    consideration / price only
 *  cons100          consideration, or Rs. 100 if higher (Govt. leases)
 *  agri3 / agri4    3x / 4x the market value at the DLC agricultural rate
 *  share            market value x partner's share %
 *  exShare          market value x (100 - partner's share %)
 *  highest          highest of: MV of shares, face value of shares, consideration
 *  highest2         highest of consideration and market value
 *  cash             share contribution brought in cash
 *  cashPlusProperty cash contribution + market value of property brought in
 *  amount:<label>   a single amount typed by the user (loan, debt, auction price…)
 */
export type Base =
  | "value"
  | "marketValue"
  | "consideration"
  | "cons100"
  | "agri3"
  | "agri4"
  | "share"
  | "exShare"
  | "highest"
  | "highest2"
  | "cash"
  | "cashPlusProperty"
  | `amount:${string}`;

export type Rule =
  | { t: "nil"; note?: string }
  | { t: "fixed"; amt: number; each?: string; max?: number }
  | { t: "pct"; rate: number; base: Base; min?: number; max?: number; cat?: boolean }
  | { t: "tele"; base: Base }
  | { t: "ofSd"; rate: number }
  | { t: "ofOrigSd"; rate: number }
  | { t: "diff"; rate: number; base: Base; cat?: boolean }
  | { t: "cashSlab"; per: number; slab: number; max: number }
  | { t: "sum"; parts: Rule[] }
  | { t: "manual"; note: string };

export interface Instrument {
  id: string;
  sno: number;
  head: string;
  headName: string;
  group: string | null;
  name: string;
  article: string;
  sd: Rule;
  rf: Rule;
  sdOrig?: Rule;
  rfOrig?: Rule;
  csi: number;
  /** "Category Applied" column — buyer category rates apply */
  cat: boolean;
  /** "Property detail" column — property details/valuation needed */
  prop: boolean;
  /** "Inspection" column — site inspection rules apply */
  insp: boolean;
  book: string;
  raw: {
    sd: string;
    sdRebate: string;
    sdNotification: string;
    rf: string;
    rfRebate: string;
    rfNotification: string;
    csi: string;
  };
  notes?: string[];
  remark?: string;
  /** Registration Act service fees (pp. 22-23) rather than an instrument */
  misc?: boolean;
}

export type PartyCategoryId =
  | "male"
  | "joint"
  | "entity"
  | "female"
  | "femaleReserved"
  | "disabled40"
  | "disabled80"
  | "transgender";

/** Every value a calculation can need. Unused fields are ignored. */
export interface DutyInputs {
  marketValue: number;
  consideration: number;
  amount: number;
  agriValue: number;
  sharePercent: number;
  cash: number;
  sharesMarketValue: number;
  sharesFaceValue: number;
  leaseMonths: number;
  originalSd: number;
  sdPaid: number;
  count: number;
  category: PartyCategoryId;
  /** Site inspection fee override; null = use the default when inspection applies. */
  inspectionFee: number | null;
}

export type InputField =
  | "marketValue"
  | "consideration"
  | "amount"
  | "agriValue"
  | "sharePercent"
  | "cash"
  | "sharesMarketValue"
  | "sharesFaceValue"
  | "leaseMonths"
  | "originalSd"
  | "sdPaid"
  | "count";

export type LineItem = { label: string; amount: number; detail?: string };

export interface DutyResult {
  /** value the instrument is assessed on (drives surcharge slab and inspection) */
  value: number;
  sd: number;
  sdBeforeRebate: number;
  surchargeRate: 0.3 | 0.33;
  surcharges: { infrastructure: number; cow: number; calamity: number; total: number };
  rf: number;
  rfBeforeRebate: number;
  csi: number;
  /** Site inspection fee, charged when inspection applies (value above Rs. 10 lakh) */
  inspectionFee: number;
  total: number;
  totalBeforeRebate: number;
  /** human-readable explanations of how each figure was reached */
  sdWorking: string;
  rfWorking: string;
  conditions: string[];
  warnings: string[];
  inspection: "Not required" | "Random" | "Compulsory" | null;
  categoryRate: number | null;
}
