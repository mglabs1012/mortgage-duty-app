// ============================================================
//  CONFIG — edit these if your SRO / document type differs.
//  VERIFIED against the Rajasthan e-GRAS Self Valuation Report
//  dated 18-06-2026, SRO AJMER-II, "Mortgage deed without
//  possession" (Urban): Applicable Value Rs.14,25,000 ->
//  SD 3,563 + Surcharge 1,175 + RF 7,125 + CSI 500 = Rs.12,363.
// ============================================================
export const CSI_CHARGE = 500; // CSI portal charge for mortgage deeds (per e-GRAS receipt)
export const CSI_MIN_LOAN = 50000; // CSI applies only when loan amount exceeds this

export const SURCHARGE_RATES = {
  infrastructure: 0.13, // Infrastructure Development Surcharge
  cowProtection: 0.1, // Cow Protection Surcharge
  naturalCalamity: 0.1, // Natural Calamity Surcharge
};

export const STAMP_RATE = { standard: 0.0025, msme: 0.00125 };
export const STAMP_CAP = { standard: 1500000, msme: 1000000 };
export const REG_RATE = 0.005;
export const REG_CAP = 100000;

export const inr = (n: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(isFinite(n) ? n : 0);

export const grouped = (digits: string): string =>
  digits ? new Intl.NumberFormat("en-IN").format(Number(digits)) : "";

export const pct = (rate: number): string => (rate * 100).toFixed(3).replace(/\.?0+$/, "");

export const FAQ_ITEMS = [
  {
    q: "What is the stamp duty rate for a mortgage or loan deed in Rajasthan?",
    a: `Stamp duty is ${pct(STAMP_RATE.standard)}% of the loan amount for standard borrowers (capped at ${inr(
      STAMP_CAP.standard
    )}), and ${pct(STAMP_RATE.msme)}% for MSME-registered borrowers (capped at ${inr(STAMP_CAP.msme)}).`,
  },
  {
    q: "What surcharges apply on top of stamp duty?",
    a: `Three surcharges are levied on the stamp duty amount: Infrastructure Development Surcharge (${pct(
      SURCHARGE_RATES.infrastructure
    )}%), Cow Protection Surcharge (${pct(SURCHARGE_RATES.cowProtection)}%), and Natural Calamity Surcharge (${pct(
      SURCHARGE_RATES.naturalCalamity
    )}%) — together adding ${pct(
      SURCHARGE_RATES.infrastructure + SURCHARGE_RATES.cowProtection + SURCHARGE_RATES.naturalCalamity
    )}% to the base stamp duty.`,
  },
  {
    q: "How is the registration fee calculated?",
    a: `Registration fee is ${pct(REG_RATE)}% of the loan amount, capped at ${inr(REG_CAP)}.`,
  },
  {
    q: "What is the CSI portal charge?",
    a: `A flat ${inr(CSI_CHARGE)} CSI (Common Software for Integrated services) portal charge applies when the loan amount exceeds ${inr(
      CSI_MIN_LOAN
    )}.`,
  },
  {
    q: "Is the MSME concession applied automatically?",
    a: "No — select the MSME category only if the borrower holds a valid Udyam/MSME registration. The concessional stamp duty rate applies only to eligible MSME loans.",
  },
  {
    q: "Are these figures final and legally binding?",
    a: "No. All figures are approximate estimates for guidance only, aligned to the Rajasthan e-GRAS calculation logic. Always verify the final applicable value and dues with your Sub-Registrar office or the official e-GRAS portal before payment.",
  },
  {
    q: "Is this a government-authorized platform?",
    a: "No, it is not. This app/website is for informational purposes only.",
  },
];

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};
