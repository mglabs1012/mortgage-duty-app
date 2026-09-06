import type { Post } from "./types";

export const post: Post = {
  meta: {
    slug: "further-charge-additional-loan-stamp-duty-rajasthan",
    title: "Stamp Duty on a Further Charge (Top-Up Loan) in Rajasthan: What Changes",
    description:
      "How Rajasthan's mortgage stamp duty notification treats a further charge or top-up loan on an already-mortgaged property, with a worked example.",
    date: "2026-09-06",
    dateLabel: "6 Sep 2026",
    tag: "Further Charge",
    readingTime: "5 min read",
  },
  faq: [
    {
      q: "What is a \"further charge\" in the context of a mortgage in Rajasthan?",
      a: "It is an instrument that adds to or extends an existing mortgage — typically used when a borrower takes an additional or top-up loan against a property already mortgaged — covered under Article 30(b)(ii) of the Rajasthan Stamp Act.",
    },
    {
      q: "Is stamp duty calculated on the original loan again, or only the top-up?",
      a: "Under the February 2026 notification's further-charge treatment, stamp duty is calculated on the additional amount being secured, not the amount that was already stamped under the original mortgage.",
    },
    {
      q: "What rate applies to a further charge?",
      a: "The same structure as a standard mortgage deed — 0.25% of the additional secured amount, subject to a maximum of ₹15 lakh, plus a 0.50% registration fee subject to a ₹1 lakh maximum.",
    },
    {
      q: "Does the MSME concession apply to a further charge?",
      a: "Yes, provided the enterprise's Udyam registration remains valid. The rate reduces to 0.125% of the additional amount, subject to a ₹10 lakh maximum, the same as for a fresh mortgage.",
    },
    {
      q: "How do I know if my top-up loan qualifies as a further charge?",
      a: "This depends on how the instrument is drafted and whether the original mortgage is still valid and subsisting. Confirm the classification with your lender's documentation team before assuming the rate applies.",
    },
  ],
  body: `
## What Is a Further Charge?

When a borrower who has already mortgaged a property takes an additional loan or enhances an existing facility against the same security, the instrument recording this is often described as a **further charge**. Rather than creating an entirely new mortgage from scratch, it adds to or extends the charge already created on the property.

Article 30(b)(ii) of the Rajasthan Stamp Act deals with instruments of this kind, and it is one of the categories specifically covered by the Rajasthan Government's notification dated 11 February 2026 — the same notification that sets the rates our [Rajasthan Mortgage Duty Calculator](/) uses for mortgage deeds generally.

## Why It Is Treated Separately From a Fresh Mortgage

A further charge is not simply "more of the same mortgage" in every respect — it is its own instrument, executed and stamped in its own right, even though it relates to security already in place. Whether a particular top-up or enhancement is correctly documented as a further charge, rather than a fresh mortgage deed, depends on the specific facts, the existing mortgage's terms, and how the lender's legal team drafts the document.

This distinction matters: get the category wrong, and you may calculate — or pay — the wrong stamp duty.

## What the February 2026 Notification Says About Further Charges

For instruments covered under Article 30(b)(ii), the notification prescribes the same concessional structure as the other instruments it covers:

| Particular | Standard | Eligible MSME |
| --- | ---: | ---: |
| Stamp duty rate | 0.25% of the further/additional amount secured | 0.125% |
| Maximum stamp duty | ₹15,00,000 | ₹10,00,000 |
| Registration fee | 0.50% | 0.50% (unchanged) |
| Maximum registration fee | ₹1,00,000 | ₹1,00,000 (unchanged) |

In other words, the rate structure mirrors the mortgage-deed rates covered elsewhere in the notification — the duty is calculated on the further or additional amount being secured, not on the original loan amount that was already stamped when the first mortgage was created. ([Finance Department Rajasthan](https://finance.rajasthan.gov.in/PDFDOCS/TAX/IGRS/14823.pdf))

## Worked Example: Topping Up an Existing Loan

Suppose a borrower originally mortgaged a property for a ₹40 lakh loan, paid stamp duty on that amount, and later takes a further ₹15 lakh top-up against the same property.

If the top-up is correctly documented as a further charge under Article 30(b)(ii):

**Stamp duty:** ₹15,00,000 × 0.25% = **₹3,750**

**Registration fee:** ₹15,00,000 × 0.50% = **₹7,500**

Only the additional ₹15 lakh is used in the calculation — the original ₹40 lakh that was already stamped is not recalculated or re-taxed. Our calculator can be used the same way for this: enter the further/additional amount, not the original loan amount, to estimate the duty on the top-up alone.

## MSME Further Charges

Where the enterprise taking the further charge is an eligible MSME, the same halved rate applies as for a fresh mortgage — 0.125% of the additional amount, subject to the ₹10 lakh cap — provided the enterprise's Udyam status is current and the necessary proof is furnished. See our [MSME concession guide](/blog/msme-stamp-duty-concession-rajasthan) for the eligibility details, which apply equally here.

## What to Confirm Before Assuming the Further-Charge Rate Applies

Because classification depends on the specific instrument and how it is drafted, confirm the following before relying on the further-charge treatment:

- That the document is genuinely drafted and executed as a further charge under Article 30(b)(ii), not a fresh, independent mortgage
- That the original mortgage is still valid and subsisting at the time the further charge is created
- That your lender's legal or documentation team has classified the instrument correctly for the specific top-up being processed
- The current rate, cap, and MSME eligibility, since notified rates can change

## Common Mistakes

**Calculating duty on the combined total** — original loan plus top-up — instead of the additional amount alone, which overstates what is payable.

**Assuming every top-up automatically qualifies as a further charge** without confirming the document has actually been drafted and classified that way.

**Skipping the MSME check on a top-up.** The concession applies as much to a further charge as it does to the original mortgage, provided the enterprise remains eligible.

> **Disclaimer:** This article is provided for general informational purposes and does not constitute legal advice. Whether a specific top-up loan qualifies as a further charge depends on its drafting and the underlying mortgage, and rates can change. Confirm the correct classification and applicable duty with your lender, the [Rajasthan Registration and Stamps Department](https://epanjiyan.rajasthan.gov.in/), or a qualified professional before relying on these figures.
`.trim(),
};
