#!/usr/bin/env python3
"""
Fees Master PDF  ->  src/stamp/data/feesMaster.ts

Usage (needs `pip install pdfplumber`):
    python3 -I scripts/fees-master/generate.py "Fees Master.pdf" src/stamp/data/feesMaster.ts

How it works
  1. Every table row of the IGRS Rajasthan "Fees Master" PDF is extracted.
  2. Rows with no SD and no RF become group headings for the rows that follow.
  3. The effective stamp duty ("SD after Rebate", else "SD") and registration
     fee ("RF after Rebate", else "RF") texts are parsed into structured rules.
  4. Rows whose wording needs judgement are set explicitly in OVERRIDES below.
     Any row the parser cannot read and that has no override aborts the run,
     so a new Fees Master edition can never silently produce a wrong rule.

The raw PDF wording is kept next to every parsed rule (raw.*) so the app can
show exactly what the Fees Master says, and so reviews are easy.
"""
import json
import re
import sys

import pdfplumber

LAKH, CRORE = 100_000, 10_000_000

# --------------------------------------------------------------------------
# Rule constructors (mirror the TS `Rule` union in src/stamp/types.ts)
# --------------------------------------------------------------------------
def nil(cond=None):
    r = {"t": "nil"}
    if cond:
        r["note"] = cond
    return r

def fixed(amt, each=None):
    r = {"t": "fixed", "amt": amt}
    if each:
        r["each"] = each
    return r

def pct(rate, base, mn=None, mx=None, cat=False):
    r = {"t": "pct", "rate": rate, "base": base}
    if mn is not None:
        r["min"] = mn
    if mx is not None:
        r["max"] = mx
    if cat:
        r["cat"] = True
    return r

def tele(base):
    return {"t": "tele", "base": base}

def of_sd(rate):
    return {"t": "ofSd", "rate": rate}

def of_orig(rate):
    return {"t": "ofOrigSd", "rate": rate}

def diff(rate, base, cat=False):
    r = {"t": "diff", "rate": rate, "base": base}
    if cat:
        r["cat"] = True
    return r

def cash_slab(per=2000, slab=50_000, mx=10_000):
    return {"t": "cashSlab", "per": per, "slab": slab, "max": mx}

def combo(*parts):
    return {"t": "sum", "parts": list(parts)}

# --------------------------------------------------------------------------
# Amount / base parsing
# --------------------------------------------------------------------------
def money(s):
    """'15 Lac' -> 1500000, 'Rs. 10000/-' -> 10000, '25 crore' -> 250000000."""
    s = s.replace(",", "").lower()
    m = re.search(r"(\d+(?:\.\d+)?)\s*(lac|lacs|lakh|lakhs|crore)?", s)
    if not m:
        return None
    v = float(m.group(1))
    unit = m.group(2)
    if unit and unit.startswith(("lac", "lakh")):
        v *= LAKH
    elif unit == "crore":
        v *= CRORE
    if "one lakh" in s:
        v = LAKH
    return int(round(v))

def find_max(s):
    m = re.search(r"max(?:imum)?\.?\s*(?:of\s*)?(?:rs\.?\s*)?([\d.,]+\s*(?:lac|lacs|lakh|lakhs|crore)?)", s, re.I)
    if m:
        return money(m.group(1))
    if re.search(r"maximum of rupees one lakh", s, re.I):
        return LAKH
    return None

def find_min(s):
    m = re.search(r"min(?:imum)?\.?\s*(?:of\s*)?(?:rs\.?\s*)?([\d.,]+)", s, re.I)
    return money(m.group(1)) if m else None

# Base keys: value | marketValue | consideration | amount:<label>
def infer_base(text):
    t = text.lower()
    if "market value" in t and "consideration" in t and "whichever is higher" in t:
        return "value"
    if "agricultur" in t:
        return None  # needs override
    if "consideration" in t:
        return "consideration"
    if "auction price" in t or "allotment price" in t:
        return "amount:Auction / allotment price"
    if "amount of debt" in t or "loan amount or debt" in t:
        return "amount:Amount of debt"
    if "loan amount" in t or "of loan amount" in t:
        return "amount:Loan amount"
    if "net asset value" in t:
        return "amount:Net asset value"
    if "project cost" in t:
        return "amount:Total project cost"
    if "increase in authorised share capital" in t:
        return "amount:Increase in authorised share capital"
    if "authorised share capital" in t:
        return "amount:Authorised share capital"
    if "amount of bond" in t:
        return "amount:Bond amount"
    if "contract" in t and "works" not in t:
        return "amount:Contract amount"
    if "works" in t:
        return "amount:Works contract value"
    if "goods or marketable security" in t:
        return "amount:Value of goods / security"
    if "normal amount of the share" in t:
        return "amount:Nominal amount of shares"
    if "land use charges" in t:
        return "amount:Land use charges"
    if "amount settled" in t:
        return "value"
    if "amount secured" in t or "value secured" in t or "amount or value secured" in t:
        return "amount:Amount secured"
    if "market value" in t:
        return "value"
    return None

def is_blank(s):
    return s.strip() in ("", "-")

def parse_sd(eff, sd_col, cat):
    """Parse effective SD text. Bare rates ('5%', 'Max 15 Lac') take their
    base from the original SD column text."""
    t = eff.strip()
    tl = t.lower()
    if re.fullmatch(r"(rs\.?\s*)?0(/-)?", tl) or tl.startswith("0 condition") or tl == "0":
        cond = None
        m = re.match(r"0\s*condition-?\s*(.*)", t, re.I)
        if m:
            cond = m.group(1).strip()
        return nil(cond)
    if "telescopic" in tl:
        b = infer_base(t) or "value"
        return tele(b)
    if "120% of sd" in tl:
        return of_orig(1.2)
    m = re.fullmatch(r"rs\.?\s*([\d,]+)\s*/?-?", tl)
    if m:
        return fixed(int(m.group(1).replace(",", "")))
    m = re.match(r"^([\d.]+)\s*%", tl)
    if m:
        rate = float(m.group(1))
        base = infer_base(t) or infer_base(sd_col)
        if base is None:
            return None
        mn, mx = find_min(t), find_max(t)
        if mx is None and "whichever is less" in tl:
            mx = find_max("max " + tl.split(" or ", 1)[1]) if " or " in tl else None
        return pct(rate, base, mn, mx, cat and rate == 6.0)
    m = re.match(r"^max(?:imum)?\.?\s*(rs\.?\s*)?([\d.,]+\s*(lac|lakh|crore)?)", tl)
    if m:  # cap only: rate comes from the SD column
        orig = parse_sd(sd_col, sd_col, cat)
        if orig and orig["t"] == "pct":
            orig["max"] = money(m.group(2))
            return orig
    return None

def parse_rf(eff, rf_col, sd_rule):
    t = eff.strip()
    tl = t.lower().replace("lakh", "lakh")
    if tl in ("0", "rs. 0/-"):
        return nil()
    if "20% amount of sd" in tl:
        return of_sd(0.2)
    m = re.fullmatch(r"(rs\.?\s*)?([\d,]+)\s*/?-?", tl)
    if m:
        return fixed(int(m.group(2).replace(",", "")))
    base = rf_base(sd_rule)
    if "of amount of debt" in tl:
        base = "amount:Amount of debt"
    m = re.match(r"^([\d.]+)\s*%", tl)
    if m:
        return pct(float(m.group(1)), base, find_min(t), find_max(t))
    if tl.startswith("max"):
        base_rule = parse_rf(rf_col, rf_col, sd_rule)
        if base_rule and base_rule["t"] == "pct":
            base_rule["max"] = find_max(t)
            return base_rule
    return None

def rf_base(sd_rule):
    """RF is charged on the same value the stamp duty is charged on."""
    if sd_rule and sd_rule.get("base"):
        return sd_rule["base"]
    return "value"

# --------------------------------------------------------------------------
# Rows that need judgement.  Keyed by the Fees Master S. No. (main schedule).
# Each value may set sd / rf / sdOrig / name / group / count / notes.
# --------------------------------------------------------------------------
V = "value"
MV = "marketValue"
CONS = "consideration"

OVERRIDES = {
    # Final conveyance after an agreement already stamped under Art. 21 Expl.(i):
    # duty is the difference over what was already paid on the agreement.
    5: dict(sd=diff(6, V, cat=True), notes=["Pay only the difference between the duty on this deed and the duty already paid on the agreement / POA.",
                                         "RF is Rs. 1000 if full registration fee was paid on the earlier agreement; otherwise 1%."]),
    8: dict(sd=pct(6, V, cat=True)),
    11: dict(sd=pct(1, "highest", mx=25 * CRORE), sdOrig=pct(1, "highest"), rf=pct(1, "highest")),
    12: dict(sd=pct(4, "amount:Market value of Rajasthan property (higher of transferor / resultant company)", mx=25 * CRORE),
             sdOrig=pct(4, "amount:Market value of Rajasthan property (higher of transferor / resultant company)"),
             rf=pct(1, "amount:Market value of Rajasthan property (higher of transferor / resultant company)")),
    14: dict(sd=nil(), sdOrig=fixed(500), rf=nil(), rfOrig=pct(1, V)),
    15: dict(sd=pct(2, V), rf=pct(1, V), notes=["Market value of TDR or market value of the property, whichever is higher."]),
    22: dict(sd=pct(0.5, CONS), sdOrig=pct(6, V), rf=pct(1, CONS)),
    23: dict(sd=pct(1, CONS), sdOrig=pct(6, V), rf=pct(1, CONS)),
    25: dict(sd=pct(0.25, "amount:Amount of debt", mx=LAKH), rf=pct(0.5, "amount:Amount of debt", mx=LAKH), rfOrig=pct(1, "amount:Amount of debt")),
    26: dict(sd=pct(6, "amount:Amount of debt"), rf=pct(1, "amount:Amount of debt")),
    27: dict(sd=pct(0.25, "amount:Net asset value", mx=LAKH), sdOrig=pct(6, "amount:Net asset value"),
             rf=pct(0.5, "amount:Net asset value", mx=LAKH), rfOrig=pct(1, "amount:Net asset value")),
    37: dict(sd=pct(6, "agri3", cat=True), sdOrig=pct(6, V), rf=pct(1, V),
             notes=["Duty is 6% of 3 times the DLC agricultural-land rate of the area (or of the adjoining area if not determined)."]),
    48: dict(sd=nil("Udyam Registration / Udyam Aadhar / EM-2 or other evidence of the enterprise category"),
             sdOrig=pct(6, "amount:Auction price"), rf=pct(1, "amount:Auction price", mx=10_000), rfOrig=pct(1, "amount:Auction price")),
    54: dict(sd=tele("amount:Allotment / auction price"), rf=of_sd(0.2), rfOrig=pct(1, "amount:Allotment / auction price")),
    55: dict(sd=pct(6, "amount:Allotment / auction price"), rf=pct(1, "amount:Allotment / auction price")),
    56: dict(sd=of_orig(1.2), sdOrig=tele("amount:Allotment / auction price"), rf=of_sd(0.2), rfOrig=pct(1, "amount:Allotment / auction price")),
    57: dict(sd=of_orig(1.2), sdOrig=pct(6, "amount:Allotment / sale consideration"), rf=pct(1, "amount:Allotment / sale consideration")),
    58: dict(sd=pct(6, "agri4"), sdOrig=pct(6, V), rf=of_sd(0.2), rfOrig=pct(1, V),
             notes=["Duty is 6% of 4 times the DLC agricultural-land rate of that area."]),
    59: dict(sd=pct(6, "agri4"), sdOrig=pct(6, V), rf=pct(1, V),
             notes=["Duty is 6% of 4 times the DLC agricultural-land rate of that area."]),
    61: dict(sd=tele("amount:Auction price"), rf=of_sd(0.2), rfOrig=pct(1, "amount:Auction price")),
    62: dict(sd=pct(6, "amount:Auction price"), rf=pct(1, "amount:Auction price")),
    63: dict(sd=of_orig(1.2), sdOrig=tele("amount:Auction price"), rf=of_sd(0.2), rfOrig=pct(1, "amount:Auction price")),
    64: dict(sd=of_orig(1.2), sdOrig=pct(6, "amount:Auction / allotment price"), rf=pct(1, "amount:Auction / allotment price")),
    66: dict(sd=tele("cons100"), rf=of_sd(0.2), rfOrig=pct(1, "cons100")),
    67: dict(sd=pct(6, "cons100"), rf=pct(1, "cons100", mn=300)),
    68: dict(sd=of_orig(1.2), rf=of_sd(0.2), rfOrig=pct(1, CONS)),
    69: dict(sd=of_orig(1.2), rf=pct(1, CONS, mn=300)),
    73: dict(sd=pct(6, "amount:Land use charges"), rf=pct(1, "amount:Land use charges")),
    75: dict(sd=fixed(500, "lease"), rf=fixed(500, "lease")),
    76: dict(sd=fixed(500, "lease"), rf=fixed(500, "lease")),
    77: dict(sd=fixed(500, "lease"), rf=fixed(500, "lease")),
    82: dict(sd=pct(0.5, CONS), sdOrig=pct(6, V), rf=pct(1, CONS)),
    83: dict(sd=of_orig(1.2), sdOrig=pct(6, V), rf=pct(1, V)),
    84: dict(sd=pct(1, CONS), sdOrig=pct(6, V), rf=pct(1, CONS)),
    85: dict(sd=of_orig(1.2), sdOrig=pct(6, V), rf=pct(1, V)),
    87: dict(sd=pct(5, CONS), sdOrig=pct(6, V), rf=pct(0.5, CONS), rfOrig=pct(1, CONS)),
    105: dict(sd=tele(V), rf=of_sd(0.2), rfOrig=pct(1, V)),
    106: dict(sd=nil("Start-up eligibility certificate"), sdOrig=tele(V), rf=of_sd(0.2), rfOrig=pct(1, V)),
    107: dict(sd=nil("Start-up eligibility certificate"), sdOrig=pct(6, V), rf=pct(1, V)),
    109: dict(sd=nil(), rf=fixed(300)),
    123: dict(sd=nil(), sdOrig=pct(6, V), rf=pct(1, V, mx=1000)),
    161: dict(sd=pct(2, V), sdOrig=pct(6, V), rf=pct(0.25, V), rfOrig=pct(1, V)),
    165: dict(sd=pct(0.15, V, mx=5 * LAKH), sdOrig=pct(2, V), rf=pct(1, V),
              notes=["Charged on the amount settled or the market value of the property."]),
    170: dict(sd=pct(0.15, "amount:Amount settled / market value of movable property", mx=5 * LAKH),
              sdOrig=pct(5, "amount:Amount settled / market value of movable property"),
              rf=pct(1, "amount:Amount settled / market value of movable property")),
    175: dict(sd=pct(0.15, "amount:Amount settled / market value", mx=5 * LAKH),
              sdOrig=pct(5, "amount:Amount settled / market value", mx=5000),
              rf=pct(1, "amount:Amount settled / market value")),
    177: dict(sd=pct(3, V), sdOrig=pct(6, V), rf=pct(0.25, V, mx=10_000), rfOrig=pct(1, V)),
    178: dict(sd=nil(), sdOrig=pct(6, "amount:Market value of the separated share(s)"),
              rf=pct(1, "amount:Market value of the separated share(s)", mx=1000), rfOrig=pct(1, "amount:Market value of the separated share(s)")),
    181: dict(sd=pct(0.25, "amount:Loan amount", mx=15 * LAKH), rf=pct(0.5, "amount:Loan amount", mx=LAKH), rfOrig=pct(1, "amount:Loan amount")),
    182: dict(sd=pct(0.125, "amount:Loan amount", mx=15 * LAKH), rf=pct(0.5, "amount:Loan amount", mx=LAKH), rfOrig=pct(1, "amount:Loan amount")),
    186: dict(sd=pct(6, "amount:Further charge amount", cat=True), rf=pct(1, "amount:Further charge amount")),
    188: dict(sd=diff(6, "amount:Total of present further charge + original mortgage + earlier further charges", cat=True),
              rf=pct(1, "amount:Total of present further charge + original mortgage + earlier further charges"),
              notes=["Duty = 6% of the combined secured amount, less stamp duty already paid on the original mortgage and earlier further charges."]),
    189: dict(sd=pct(0.25, "amount:Further charge amount", mx=15 * LAKH), sdOrig=pct(2, "amount:Further charge amount"),
              rf=pct(0.5, "amount:Further charge amount", mx=LAKH), rfOrig=pct(1, "amount:Further charge amount")),
    190: dict(sd=pct(0.125, "amount:Further charge amount", mx=10 * LAKH), rf=pct(0.5, "amount:Further charge amount", mx=LAKH),
              rfOrig=pct(1, "amount:Further charge amount")),
    192: dict(sd=pct(6, "amount:Amount secured", cat=True), rf=pct(1, "amount:Amount secured")),
    193: dict(sd=pct(0.25, "amount:Amount secured", mx=15 * LAKH), sdOrig=pct(2, "amount:Amount secured"),
              rf=pct(0.5, "amount:Amount secured", mx=LAKH), rfOrig=pct(1, "amount:Amount secured")),
    195: dict(sd=pct(0.15, "amount:Amount secured", mx=5 * LAKH), sdOrig=pct(5, "amount:Amount secured"), rf=pct(1, "amount:Amount secured")),
    210: dict(sd=pct(6, V, cat=True), rf=pct(1, V)),
    211: dict(sd=pct(6, V, cat=True), rf=pct(1, V)),
    212: dict(sd=pct(6, V, cat=True), rf=pct(1, V)),
    214: dict(sd=fixed(2000), rf=fixed(2000)),
    215: dict(sd=pct(0.5, V), sdOrig=pct(2, V), rf=pct(0.25, V, mx=10_000), rfOrig=pct(1, V)),
    217: dict(sd=pct(1.25, V), sdOrig=pct(6, V), rf=pct(1, V)),
    219: dict(sd=fixed(500, "person"), rf=fixed(2000)),
    223: dict(sd=pct(0.5, CONS), sdOrig=pct(3, CONS), rf=pct(0.25, CONS, mx=10_000), rfOrig=pct(1, CONS)),
    225: dict(sd=pct(0.25, "amount:Loan amount", mx=15 * LAKH), rf=pct(0.5, "amount:Loan amount", mx=LAKH), rfOrig=pct(1, "amount:Loan amount")),
    230: dict(sd=nil("Eligibility certificate under the Rajasthan Start-up Policy, 2022"), sdOrig=pct(0.25, "amount:Loan amount"),
              rf=pct(0.5, "amount:Loan amount", mx=LAKH), rfOrig=pct(1, "amount:Loan amount")),
    231: dict(sd=pct(0.25, "amount:Loan amount"), rf=pct(0.5, "amount:Loan amount", mx=LAKH), rfOrig=pct(1, "amount:Loan amount")),
    234: dict(sd=nil(), sdOrig=pct(2, "amount:Amount secured"), rf=pct(0.5, "amount:Amount secured", mx=LAKH), rfOrig=pct(1, "amount:Amount secured")),
    236: dict(sd=pct(1.25, V), sdOrig=pct(6, V), rf=pct(1, V)),
    245: dict(sd=pct(0.5, CONS), sdOrig=pct(3, CONS), rf=fixed(1000), rfOrig=pct(1, CONS)),
    246: dict(sd=pct(0.5, CONS), sdOrig=pct(6, V), rf=fixed(1000), rfOrig=pct(1, CONS)),
    247: dict(sd=pct(1, CONS), sdOrig=pct(6, V), rf=fixed(1000), rfOrig=pct(1, CONS)),
    250: dict(sd=tele(V), rf=of_sd(0.2), rfOrig=pct(1, V)),
    256: dict(sd=fixed(5000), rf=pct(1, V)),
    259: dict(sd=fixed(5000), rf=pct(1, V)),
    255: dict(sd=pct(0.5, V), sdOrig=pct(2, V), rf=pct(1, V, mx=10_000), rfOrig=pct(1, V)),
    258: dict(sd=pct(0.5, V), sdOrig=pct(2, V), rf=pct(1, V, mx=10_000), rfOrig=pct(1, V)),
    260: dict(sd=pct(4, "highest2"), rf=pct(1, "highest2")),
    262: dict(sd=fixed(2000), rf=pct(1, "cash")),
    263: dict(sd=cash_slab(), rf=pct(1, "cash")),
    264: dict(sd=pct(6, "exShare"), rf=pct(1, "exShare")),
    265: dict(sd=combo(cash_slab(), pct(6, "exShare")), rf=pct(1, "cashPlusProperty")),
    267: dict(sd=pct(6, MV), rf=pct(1, MV)),
    268: dict(sd=pct(6, "share"), rf=pct(1, "share")),
    270: dict(sd=pct(6, "share"), rf=pct(1, "share")),
    271: dict(sd=pct(6, MV), rf=pct(1, MV)),
    272: dict(sd=pct(6, "exShare"), rf=pct(1, "exShare")),
    273: dict(sd=fixed(500), rf=pct(1, V)),
    274: dict(sd=fixed(500), rf=pct(1, V)),
    275: dict(sd=fixed(500), rf=pct(1, V)),
    278: dict(sd=fixed(2000), rf=pct(1, "cash")),
    279: dict(sd=cash_slab(), rf=pct(1, "cash")),
    280: dict(sd=pct(6, "exShare"), rf=pct(1, "exShare")),
    281: dict(sd=combo(cash_slab(), pct(6, "exShare")), rf=pct(1, "cashPlusProperty")),
    283: dict(sd=pct(6, MV), rf=pct(1, MV)),
    284: dict(sd=fixed(500), sdOrig=pct(6, MV), rf=pct(1, MV)),
    285: dict(sd=pct(6, "exShare"), rf=pct(1, "exShare")),
    286: dict(sd=fixed(500), sdOrig=pct(6, "exShare"), rf=pct(1, "exShare")),
    288: dict(sd=pct(6, "share"), rf=pct(1, "share")),
    289: dict(sd=fixed(500), sdOrig=pct(6, "share"), rf=pct(1, "share")),
    290: dict(sd=pct(6, MV), rf=pct(1, MV)),
    291: dict(sd=fixed(500), sdOrig=pct(6, MV), rf=pct(1, MV)),
    292: dict(sd=pct(6, "exShare"), rf=pct(1, "exShare")),
    293: dict(sd=fixed(500), sdOrig=pct(6, "exShare"), rf=pct(1, "exShare")),
    300: dict(sd=pct(0.15, V, mx=5 * LAKH), sdOrig=pct(6, V), rf=pct(1, V)),
    302: dict(sd=pct(6, V, cat=True), rf=pct(1, V)),
    303: dict(sd=pct(0.15, "amount:Amount settled / market value of movable property", mx=5 * LAKH),
              sdOrig=pct(6, "amount:Amount settled / market value of movable property"),
              rf=pct(1, "amount:Amount settled / market value of movable property")),
    308: dict(sd=nil(), sdOrig=pct(0.5, "amount:Market value of movable property"), rf=fixed(500)),
    314: dict(sd=nil(), rf=fixed(100, "year"), csi=0),
    315: dict(sd=nil(), rf=fixed(100, "slot"), csi=0),
    321: dict(sd=pct(6, MV, cat=True), rf=pct(1, MV),
              notes=["Market value of the property as on the date of execution of the cancellation."]),
    339: dict(sd=pct(0.15, "amount:Amount secured", mx=5 * LAKH), sdOrig=pct(5, "amount:Amount secured"), rf=pct(1, "amount:Amount secured")),
    341: dict(sd=pct(0.25, "amount:Amount secured / market value of property mortgaged", mx=15 * LAKH),
              sdOrig=pct(0.5, "amount:Amount secured / market value of property mortgaged", mn=1000),
              rf=pct(1, "amount:Amount secured / market value of property mortgaged")),
    342: dict(sd=pct(0.25, "amount:Amount secured", mx=15 * LAKH), sdOrig=pct(0.5, "amount:Amount secured", mn=1000),
              rf=pct(0.5, "amount:Amount secured", mx=LAKH), rfOrig=pct(1, "amount:Amount secured")),
    343: dict(sd=pct(0.125, "amount:Loan amount", mx=10 * LAKH), rf=pct(0.5, "amount:Loan amount", mx=LAKH), rfOrig=pct(1, "amount:Loan amount")),
    351: dict(sd=pct(0.15, "amount:Works contract value", mx=25 * LAKH)),
    359: dict(sd=pct(0.2, "amount:Increase in authorised share capital", mx=25 * LAKH),
              sdOrig=pct(0.5, "amount:Increase in authorised share capital")),
    367: dict(sd=fixed(100), rf=fixed(100), csi=0,
              notes=["RF is Rs. 100 without map; add Rs. 50 if the copy includes a map (see Registration services)."]),
    364: dict(sd=pct(0.5, "amount:Authorised share capital", mn=500)),
    381: dict(sd=pct(6, V), rf=fixed(500)),
    382: dict(sd=pct(0.5, "amount:Market value / consideration of movable property"), rf=fixed(500)),
    389: dict(sd=pct(0.15, "amount:Nominal amount of shares", mx=5 * LAKH), sdOrig=pct(5, "amount:Nominal amount of shares")),
    413: dict(sd=nil(), rf=pct(1, "amount:Amount of bond")),
    416: dict(sd=pct(0.15, "amount:Amount secured", mx=5 * LAKH), sdOrig=pct(5, "amount:Amount secured"), rf=pct(1, "amount:Amount secured")),
}

# Rows the PDF lists under a group they do not belong to.
UNGROUP = {2, 37, 38, 39, 40, 41, 42, 110, 111, 112, 116, 117, 146, 147, 203, 205, 220, 234, 248, 308}

# Misc. Registration Act fees (separate numbering on pp. 22-23): RF only.
def misc_rf(text):
    t = text.lower()
    if t.startswith("same as"):
        return None
    m = re.search(r"rs\.?\s*([\d,]+)", t)
    if not m:
        return nil() if t.strip() == "0" else None
    amt = int(m.group(1).replace(",", ""))
    each = None
    if "each folio" in t:
        each = "folio"
    elif "each copy" in t:
        each = "copy"
    r = fixed(amt, each)
    mx = find_max(t)
    if mx and mx != amt:
        r["max"] = mx
        r["each"] = r.get("each") or "month"
    return r


MISC_HEADS = {
    "1": "Registration services (Registration Act)",
    "2": "Applications & processes",
    "3": "Appeals, petitions & holiday registration",
}


def clean(s):
    s = re.sub(r"\s+", " ", (s or "").replace("\n", " ")).strip()
    return s.replace("’", "'").replace("“", '"').replace("”", '"')


def main(src, out):
    rows = []
    with pdfplumber.open(src) as pdf:
        for page in pdf.pages:
            for t in page.extract_tables():
                for r in t:
                    rows.append([clean(c) for c in r])

    entries, errors = [], []
    head_names = {}
    group = None
    group_first = False
    last_head = None
    misc_mode = False
    last_misc_head = [None]

    for c in rows:
        if not c or c[0] in ("S. No.", "1"):
            continue
        if len(c) == 15:
            misc_mode = True
        if len(c) not in (15, 17):
            continue
        sno = int(re.sub(r"\D", "", c[0]) or 0)
        if not sno:
            continue

        if misc_mode:
            _, head, head_name, name, art, sd, sdr, sdn, rf, rfr, rfn, _prop, _book, _cat, _rem = c
            if re.match(r"^\d{4}-\d+/", rfr):
                rfr = ""  # a notification number sits in this column for some rows
            rf_eff = rfr if not is_blank(rfr) else rf
            if head != last_misc_head[0]:
                group = None
                last_misc_head[0] = head
            if not rf and not sd and not rfr:
                group = name.rstrip("-:– ").strip()
                continue
            rule = misc_rf(rf_eff)
            if rule is None:
                rule = {"t": "manual", "note": rf_eff}
            name_clean = re.sub(r"^\d+\.\s*", "", name)
            entries.append(dict(
                id=f"R{sno}", sno=sno, head=f"R{head}", headName=MISC_HEADS.get(head, head_name),
                group=group if group and re.match(r"^\(", name) else None,
                name=name_clean, article=art or "",
                sd=nil(), rf=rule, csi=0, cat=False, prop=False, insp=False, book="",
                raw=dict(sd=sd, sdRebate=sdr, sdNotification=sdn, rf=rf, rfRebate=rfr, rfNotification=rfn, csi=""),
                misc=True,
            ))
            continue

        (_, head, head_name, name, art, sd, sdr, sdn, rf, rfr, rfn, csi, prop, book, cat, insp, rem) = c
        if head:
            last_head = head
        head = head or last_head
        if head_name and head not in head_names:
            head_names[head] = head_name
        if is_blank(sd) and is_blank(rf) and is_blank(sdr):
            if name:
                group = name.rstrip("-:– ").strip()
                group_first = True
            continue

        enumerated = bool(re.match(r"^\(?([ivx]{1,6}|[a-e]{1,2}|\d|[a-e]\.\w+)\)", name, re.I))
        g = group if (enumerated or group_first) and sno not in UNGROUP else None
        if not (enumerated or group_first):
            group = None
        group_first = False

        cat_flag = cat == "Y"
        sd_eff = sdr if not is_blank(sdr) else sd
        ov = OVERRIDES.get(sno, {})
        sd_rule = ov.get("sd") or parse_sd(sd_eff, sd, cat_flag)
        sd_orig = ov.get("sdOrig") or (parse_sd(sd, sd, cat_flag) if not is_blank(sdr) else None)
        rf_eff = rfr if not is_blank(rfr) else rf
        base_src = sd_rule if (sd_rule and sd_rule.get("base")) else sd_orig
        rf_rule = ov.get("rf") or parse_rf(rf_eff, rf, base_src)
        rf_orig = ov.get("rfOrig") or (parse_rf(rf, rf, base_src) if not is_blank(rfr) else None)

        if sd_rule is None:
            errors.append(f"#{sno} SD unparsed: {sd_eff!r}")
        if rf_rule is None and not is_blank(rf_eff):
            errors.append(f"#{sno} RF unparsed: {rf_eff!r}")
        if rf_rule is None:
            rf_rule = nil()

        csi_val = ov.get("csi")
        if csi_val is None:
            m = re.search(r"(\d+)", csi or "")
            csi_val = int(m.group(1)) if m else 0

        entry = dict(
            id=f"S{sno}", sno=sno, head=head, headName=head_names.get(head, head_name),
            group=ov.get("group", g), name=ov.get("name", name), article=art,
            sd=sd_rule, rf=rf_rule, csi=csi_val,
            cat=cat_flag, prop=prop == "Y", insp=insp == "Y", book=book,
            raw=dict(sd=sd, sdRebate=sdr, sdNotification=sdn, rf=rf, rfRebate=rfr, rfNotification=rfn, csi=csi),
        )
        if sd_orig and sd_orig != sd_rule:
            entry["sdOrig"] = sd_orig
        if rf_orig and rf_orig != rf_rule:
            entry["rfOrig"] = rf_orig
        if ov.get("notes"):
            entry["notes"] = ov["notes"]
        if rem:
            entry["remark"] = rem
        entries.append(entry)

    if errors:
        print("Unparsed rows (add them to OVERRIDES):", *errors, sep="\n  ")
        sys.exit(1)

    body = json.dumps(entries, ensure_ascii=False, indent=1)
    with open(out, "w", encoding="utf-8") as f:
        f.write(
            "// AUTO-GENERATED by scripts/fees-master/generate.py from the IGRS Rajasthan\n"
            "// \"Fees Master\" (Stamp Duty and Registration Fee Detail, applicable on 07-05-2026).\n"
            "// Do not edit by hand: change OVERRIDES in the generator and re-run it.\n"
            "import type { Instrument } from \"../types.ts\";\n\n"
            f"export const FEES_MASTER_DATE = \"07-05-2026\";\n\n"
            f"export const INSTRUMENTS: Instrument[] = {body};\n"
        )
    print(f"wrote {len(entries)} instruments -> {out}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
