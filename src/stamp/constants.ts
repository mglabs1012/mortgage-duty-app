import type { PartyCategoryId } from "./types.ts";

/**
 * Buyer / claimant category rates (Fees Master pp. 1 & 25).
 * Applied only to instruments whose "Category Applied" column is Y, in place
 * of the general 6% rate.
 */
export const PARTY_CATEGORIES: {
  id: PartyCategoryId;
  label: string;
  short: string;
  rate: number;
  notification: string;
  needsCertificate?: boolean;
}[] = [
  { id: "male", label: "General — Male", short: "Male", rate: 6, notification: "2020-135 / 20-02-2020" },
  { id: "joint", label: "Male & Female jointly", short: "Joint (M+F)", rate: 6, notification: "2020-135 / 20-02-2020" },
  { id: "entity", label: "Legal entity (company, firm, society…)", short: "Legal entity", rate: 6, notification: "2020-135 / 20-02-2020" },
  { id: "female", label: "Female (other than SC/ST/BPL)", short: "Female", rate: 5, notification: "2020-131 / 20-02-2020" },
  { id: "femaleReserved", label: "Female — SC / ST / BPL", short: "Female SC/ST/BPL", rate: 4, notification: "2020-131 / 20-02-2020" },
  { id: "disabled40", label: "Person with disability (40% – 80%)", short: "Disabled 40–80%", rate: 4, notification: "2023-32 / 10-02-2023" },
  {
    id: "disabled80",
    label: "Person with disability (above 80%)",
    short: "Disabled >80%",
    rate: 0,
    notification: "2023-48 / 29-03-2023",
    needsCertificate: true,
  },
  {
    id: "transgender",
    label: "Transgender person",
    short: "Transgender",
    rate: 0,
    notification: "2023-47 / 29-03-2023",
    needsCertificate: true,
  },
];

export const categoryRate = (id: PartyCategoryId) =>
  PARTY_CATEGORIES.find((c) => c.id === id)?.rate ?? 6;

/** Surcharge on stamp duty (Fees Master p. 1, "Common Fee/Charges"). */
export const SURCHARGE = {
  /** value up to Rs. 10 lakh, or duty not ad valorem: 10 + 20 = 30% */
  low: { infrastructure: 0.1, cow: 0.1, calamity: 0.1 },
  /** all other cases: 13 + 20 = 33% */
  high: { infrastructure: 0.13, cow: 0.1, calamity: 0.1 },
  threshold: 10_00_000,
};

/**
 * Site inspection fee (मौका निरीक्षण शुल्क). Not stated in the Fees Master.
 * Rs. 1,000 is what SR Ajmer-II charged on sale deeds valued Rs. 11 lakh and
 * Rs. 12 lakh (Nov 2026) — charged even though inspection in that band is only
 * "Random". Higher-value slabs may differ, so the app lets the user edit it.
 */
export const SITE_INSPECTION_FEE_DEFAULT = 1000;

/** Site inspection by document value (Fees Master p. 1). */
export function inspectionStatus(value: number): "Not required" | "Random" | "Compulsory" {
  if (value > 50_00_000) return "Compulsory";
  if (value > 10_00_000) return "Random";
  return "Not required";
}

/**
 * Article 33 telescopic lease rates (Rajasthan Finance Act, 2023): a per-year
 * factor (% of market value); the duty rate is the average across the lease
 * years, with any part-year rounded up to a full year.
 *   year 1: 0.02 · years 2–5: 0.12 · 6–10: 0.9 · 11–15: 2 · 16–20: 5 · 21–30: 8
 * e.g. 5 years = (1×0.02 + 4×0.12) / 5 = 0.1%;  30 years = 120 / 30 = 4%.
 */
export const TELESCOPIC_BANDS = [
  { from: 1, to: 1, factor: 0.02 },
  { from: 2, to: 5, factor: 0.12 },
  { from: 6, to: 10, factor: 0.9 },
  { from: 11, to: 15, factor: 2 },
  { from: 16, to: 20, factor: 5 },
  { from: 21, to: 30, factor: 8 },
];

export const COUNT_UNIT_LABEL: Record<string, string> = {
  lease: "Number of new lease deeds",
  person: "Number of persons authorised",
  year: "Number of years searched",
  slot: "Number of time slots",
  folio: "Number of folios",
  copy: "Number of copies",
  month: "Number of months",
};
