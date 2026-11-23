import { ADD_ONS, addOnTotal, byId, displayName, headMeta } from "../catalog.ts";
import { PARTY_CATEGORIES } from "../constants.ts";
import { rupees } from "../engine.ts";
import type { DutyInputs, DutyResult, Instrument } from "../types.ts";
import type { QuoteDetails } from "../quote.ts";

/** Print-only estimate handed to the client (shown when printing / saving as PDF). */
export function QuoteSheet({
  ins,
  result,
  inputs,
  addOns,
  quote,
  refNo,
}: {
  ins: Instrument;
  result: DutyResult;
  inputs: DutyInputs;
  addOns: string[];
  quote: QuoteDetails;
  refNo: string;
}) {
  const extras = addOnTotal(addOns);
  const grand = result.total + extras;
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const cat = PARTY_CATEGORIES.find((c) => c.id === inputs.category);
  const party: [string, string][] = (
    [
      ["Client", quote.client],
      ["Mobile", quote.mobile],
      ["First party (executant)", quote.firstParty],
      ["Second party (claimant)", quote.secondParty],
      ["Property / subject", quote.property],
    ] as [string, string][]
  ).filter(([, v]) => v.trim());

  const lines: [string, number, string?][] = [
    ["Stamp duty", result.sd, result.sdWorking],
    [`Infrastructure surcharge (${result.surchargeRate === 0.33 ? 13 : 10}%)`, result.surcharges.infrastructure],
    ["Cow protection surcharge (10%)", result.surcharges.cow],
    ["Natural calamity surcharge (10%)", result.surcharges.calamity],
    ["Registration fee", result.rf, result.rfWorking],
    ["CSI (copying, scanning & indexing)", result.csi],
    ...addOns.map((id): [string, number] => [ADD_ONS.find((a) => a.id === id)?.label ?? byId(id)?.name ?? id, addOnTotal([id])]),
  ];

  return (
    <div className="hidden text-[12px] leading-relaxed text-black print:block">
      <div className="flex items-start justify-between border-b-2 border-black pb-3">
        <div>
          <p className="font-display text-xl font-extrabold">{quote.preparedBy || "Stamp Duty & Registration Estimate"}</p>
          <p className="text-[11px] text-neutral-600">Estimate of stamp duty &amp; registration fees · Rajasthan</p>
        </div>
        <div className="text-right text-[11px]">
          <p>
            <b>Date:</b> {today}
          </p>
          <p>
            <b>Ref:</b> {refNo}
          </p>
        </div>
      </div>

      {party.length > 0 && (
        <table className="mt-4 w-full border-collapse">
          <tbody>
            {party.map(([k, v]) => (
              <tr key={k}>
                <td className="w-48 border border-neutral-300 bg-neutral-50 px-2 py-1 font-semibold">{k}</td>
                <td className="border border-neutral-300 px-2 py-1">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 rounded border border-neutral-300 p-3">
        <p className="font-bold">
          {headMeta(ins.head).label} — {displayName(ins)}
        </p>
        <p className="text-[11px] text-neutral-600">
          Article {ins.article || "—"} · Fees Master S.No. {ins.sno}
          {result.categoryRate !== null && cat ? ` · Buyer category: ${cat.label} (${cat.rate}%)` : ""}
          {result.value > 0 ? ` · Assessed value ${rupees(result.value)}` : ""}
        </p>
      </div>

      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr className="bg-neutral-100">
            <th className="border border-neutral-300 px-2 py-1 text-left">Particulars</th>
            <th className="w-32 border border-neutral-300 px-2 py-1 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map(([label, amt, note]) => (
            <tr key={label}>
              <td className="border border-neutral-300 px-2 py-1">
                {label}
                {note && <span className="block text-[10px] text-neutral-500">{note}</span>}
              </td>
              <td className="border border-neutral-300 px-2 py-1 text-right tabular-nums">{rupees(amt)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="border border-black px-2 py-1.5">TOTAL PAYABLE (approx.)</td>
            <td className="border border-black px-2 py-1.5 text-right text-[14px] tabular-nums">{rupees(grand)}</td>
          </tr>
        </tbody>
      </table>

      {result.conditions.length > 0 && (
        <div className="mt-3">
          <p className="font-semibold">Conditions &amp; notes</p>
          <ul className="list-disc pl-5">
            {result.conditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      {result.inspection && <p className="mt-2">Site inspection: {result.inspection}.</p>}

      <p className="mt-5 border-t border-neutral-300 pt-2 text-[10px] text-neutral-600">
        Estimate prepared from the IGRS Rajasthan Fees Master (applicable 07-05-2026). Figures are approximate and subject to
        valuation by the Sub-Registrar; the Rajasthan Stamp Act 1998, Registration Act 1908 and notifications in force prevail.
        Verify on e-GRAS before payment.
      </p>
      <div className="mt-10 flex justify-end">
        <p className="border-t border-black px-8 pt-1 text-[11px]">Authorised signature</p>
      </div>
    </div>
  );
}
