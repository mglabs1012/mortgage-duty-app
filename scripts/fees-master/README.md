# Fees Master → stamp duty data

The all-deeds calculator (`/stamp-duty`) is driven by `src/stamp/data/feesMaster.ts`,
generated from the IGRS Rajasthan **Fees Master** PDF ("Stamp Duty and Registration Fee Detail").

## Update to a new Fees Master edition

```bash
pip install pdfplumber
python3 -I scripts/fees-master/generate.py "Fees Master.pdf" src/stamp/data/feesMaster.ts
node --test scripts/fees-master/engine.test.ts
```

- The generator parses each row's SD / SD-after-rebate / RF / RF-after-rebate text into rules.
- Rows whose wording needs judgement are pinned in `OVERRIDES` (keyed by Fees Master S. No.).
- If a row can't be parsed and has no override, the run **fails** and lists it; nothing is
  silently guessed. Update `FEES_MASTER_DATE` in the generator output header if the date changes.
- `engine.test.ts` holds hand-worked figures (including a real e-GRAS receipt); keep it green.

## Not in the PDF (sourced elsewhere)

- Article 33 telescopic lease factors (Rajasthan Finance Act, 2023), in `src/stamp/constants.ts`.
