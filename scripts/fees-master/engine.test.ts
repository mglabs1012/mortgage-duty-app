// Run: node --test scripts/fees-master/engine.test.ts   (Node 22.18+ strips TS types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import { INSTRUMENTS } from "../../src/stamp/data/feesMaster.ts";
import { computeDuty, EMPTY_INPUTS, fieldsFor, telescopicRate } from "../../src/stamp/engine.ts";
import type { DutyInputs } from "../../src/stamp/types.ts";

const ins = (id: string) => {
  const found = INSTRUMENTS.find((x) => x.id === id);
  assert.ok(found, `instrument ${id} missing`);
  return found;
};
const run = (id: string, p: Partial<DutyInputs>) => computeDuty(ins(id), { ...EMPTY_INPUTS, ...p });

test("mortgage without possession matches the verified e-GRAS receipt (Rs. 14,25,000 -> 12,363)", () => {
  const r = run("S193", { amount: 1425000 });
  assert.equal(r.sd, 3563);
  assert.equal(r.surcharges.total, 1175);
  assert.equal(r.rf, 7125);
  assert.equal(r.csi, 500);
  assert.equal(r.total, 12363);
});

test("surcharge drops to 30% for values up to Rs. 10 lakh", () => {
  const r = run("S193", { amount: 500000 });
  assert.equal(r.sd, 1250);
  assert.equal(r.surchargeRate, 0.3);
  assert.equal(r.surcharges.total, 375);
  assert.equal(r.total, 1250 + 375 + 2500 + 500);
});

test("sale deed: higher of DLC and consideration, buyer category rate, rebate shown", () => {
  const male = run("S2", { marketValue: 5000000, consideration: 4500000, category: "male" });
  assert.equal(male.sd, 300000);
  assert.equal(male.surcharges.total, 99000);
  assert.equal(male.rf, 50000);
  assert.equal(male.total, 449500);

  const female = run("S2", { marketValue: 5000000, consideration: 4500000, category: "female" });
  assert.equal(female.sd, 250000);
  assert.equal(female.total, 250000 + 82500 + 50000 + 500);
  assert.equal(female.totalBeforeRebate, 449500);
  assert.equal(female.categoryRate, 5);

  const trans = run("S2", { marketValue: 5000000, category: "transgender" });
  assert.equal(trans.sd, 0);
  assert.equal(trans.surcharges.total, 0);
  assert.ok(trans.conditions.some((c) => c.includes("certificate")));
});

test("telescopic lease rates (Art. 33)", () => {
  assert.equal(telescopicRate(1).rate, 0.02);
  assert.ok(Math.abs(telescopicRate(5).rate - 0.1) < 1e-9);
  assert.ok(Math.abs(telescopicRate(10).rate - 0.5) < 1e-9);
  assert.ok(Math.abs(telescopicRate(20).rate - 2) < 1e-9);
  assert.ok(Math.abs(telescopicRate(30).rate - 4) < 1e-9);
});

test("rent deed: 5-year lease on Rs. 1 crore property, RF = 20% of SD", () => {
  const r = run("S51", { marketValue: 10000000, leaseMonths: 60 });
  assert.equal(r.sd, 10000);
  assert.equal(r.surcharges.total, 3300);
  assert.equal(r.rf, 2000);
  assert.equal(r.total, 15800);
});

test("11-month rent deed rounds up to one year", () => {
  const r = run("S50", { marketValue: 2000000, leaseMonths: 11 });
  assert.equal(r.sd, 400);
  assert.equal(r.surcharges.total, 52 + 40 + 40);
  assert.equal(r.rf, 80);
});

test("gift to brother at 2.5% with the 6% rebate visible", () => {
  const r = run("S124", { marketValue: 4000000 });
  assert.equal(r.sd, 100000);
  assert.equal(r.sdBeforeRebate, 240000);
  assert.equal(r.rf, 40000);
  assert.equal(r.total, 100000 + 33000 + 40000 + 500);
});

test("gift to daughter: nil duty, 1% registration fee", () => {
  const r = run("S121", { marketValue: 3000000 });
  assert.equal(r.sd, 0);
  assert.equal(r.rf, 30000);
  assert.equal(r.total, 30500);
});

test("partnership cash contribution: Rs. 2000 per Rs. 50,000 slab, max Rs. 10,000", () => {
  const r = run("S279", { cash: 120000 });
  assert.equal(r.sd, 6000);
  assert.equal(r.surcharges.total, 1800);
  assert.equal(r.rf, 1200);
  assert.equal(run("S279", { cash: 1000000 }).sd, 10000);
});

test("partnership property brought in excludes the partner's own share", () => {
  const r = run("S280", { marketValue: 1000000, sharePercent: 40 });
  assert.equal(r.sd, 36000);
});

test("fixed-duty instruments: per-person POA, ancestral release, will, govt document", () => {
  const poa = run("S219", { count: 3 });
  assert.equal(poa.sd, 1500);
  assert.equal(poa.surcharges.total, 450);
  assert.equal(poa.total, 1500 + 450 + 2000 + 500);
  assert.equal(run("S158", {}).total, 500 + 150 + 500 + 500);
  assert.equal(run("S306", {}).total, 700);
  assert.equal(run("S307", { marketValue: 9999999 }).total, 0);
});

test("final conveyance pays only the difference over duty already paid", () => {
  const r = run("S5", { marketValue: 6000000, sdPaid: 100000, category: "female" });
  assert.equal(r.sd, 200000);
});

test("minimums, caps and value-range warnings", () => {
  assert.equal(run("S239", { amount: 100000 }).sd, 500);
  assert.equal(run("S239", { amount: 100000000 }).sd, 25000);
  assert.equal(run("S193", { amount: 900000000 }).sd, 1500000);
  assert.equal(run("S193", { amount: 900000000 }).rf, 100000);
  assert.ok(run("S18", { marketValue: 6000000 }).warnings.length > 0);
  assert.equal(run("S18", { marketValue: 4000000 }).warnings.length, 0);
});

test("every instrument evaluates without throwing and asks for sensible fields", () => {
  for (const x of INSTRUMENTS) {
    const r = computeDuty(x, { ...EMPTY_INPUTS, marketValue: 2500000, consideration: 2000000, amount: 2500000, leaseMonths: 36, count: 2 });
    assert.ok(Number.isFinite(r.total), x.id);
    assert.ok(r.total >= 0, x.id);
    fieldsFor(x);
  }
  assert.ok(INSTRUMENTS.length > 350);
});
