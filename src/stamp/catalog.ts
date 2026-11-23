import {
  ArrowLeftRight,
  Banknote,
  BookUser,
  Building2,
  Car,
  FileInput,
  FileSignature,
  FileText,
  Gavel,
  Gift,
  Handshake,
  HardHat,
  HeartHandshake,
  Home,
  KeyRound,
  Landmark,
  Map as MapIcon,
  Scale,
  ScrollText,
  Search,
  Shapes,
  Ship,
  Split,
  Stamp,
  Target,
  Undo2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { INSTRUMENTS } from "./data/feesMaster.ts";
import type { Instrument, Rule } from "./types.ts";

type HeadMeta = { label: string; hindi?: string; icon: LucideIcon; keywords?: string };

export const HEAD_META: Record<string, HeadMeta> = {
  "1": { label: "Sale Deed", hindi: "विक्रय पत्र", icon: Home, keywords: "sale conveyance registry bainama vikray purchase buy flat plot house" },
  "2": { label: "Certificate of Sale", hindi: "विक्रय प्रमाण पत्र", icon: Gavel, keywords: "auction nilami" },
  "3": { label: "Lease Deed", hindi: "पट्टा / किरायानामा", icon: KeyRound, keywords: "lease rent kirayanama kiraya patta mining" },
  "4": { label: "Other Lease Deeds", hindi: "अन्य पट्टा", icon: Building2, keywords: "lease patta awas yojana assignment surrender" },
  "5": { label: "Gift Deed", hindi: "दान पत्र", icon: Gift, keywords: "gift daan dan patra hiba" },
  "6": { label: "Release Deed", hindi: "हक त्याग", icon: Undo2, keywords: "release relinquishment hak tyag haq tyag" },
  "7": { label: "Exchange Deed", hindi: "विनिमय पत्र", icon: ArrowLeftRight, keywords: "exchange vinimay adla badli" },
  "8": { label: "Settlement Deed", hindi: "व्यवस्थापन पत्र", icon: ScrollText, keywords: "settlement dower" },
  "9": { label: "Partition Deed", hindi: "विभाजन पत्र", icon: Split, keywords: "partition batwara vibhajan" },
  "10": { label: "Mortgage / Charge", hindi: "बंधक पत्र", icon: Landmark, keywords: "mortgage loan girvi rehan bandhak title deed further charge modt" },
  "11": { label: "Power of Attorney", hindi: "मुख्तारनामा", icon: FileSignature, keywords: "poa power attorney mukhtarnama aam khas" },
  "12": { label: "Agreements", hindi: "अनुबंध / इकरारनामा", icon: Handshake, keywords: "agreement ikrarnama anubandh loan developer licence" },
  "13": { label: "Partnership / LLP", hindi: "भागीदारी", icon: Users, keywords: "partnership llp firm bhagidari partner" },
  "14": { label: "Trust", hindi: "न्यास", icon: HeartHandshake, keywords: "trust nyas charitable" },
  "15": { label: "Will", hindi: "वसीयत", icon: BookUser, keywords: "will vasiyat wasiyat" },
  "16": { label: "Govt. Documents", hindi: "सरकारी दस्तावेज़", icon: Landmark, keywords: "government govt" },
  "17": { label: "Movable Property", hindi: "चल संपत्ति", icon: Car, keywords: "movable vehicle" },
  "18": { label: "Land Use Change", hindi: "भू-उपयोग परिवर्तन", icon: MapIcon, keywords: "conversion land use 90a" },
  "20": { label: "Inspection & Search", hindi: "निरीक्षण", icon: Search, keywords: "inspection search" },
  "21": { label: "Other Deeds", hindi: "अन्य विलेख", icon: FileText, keywords: "adoption cancellation supplementary divorce composition" },
  "22": { label: "Bonds & Guarantees", hindi: "बंधपत्र", icon: Banknote, keywords: "bond guarantee indemnity security" },
  "23": { label: "Works Contract", hindi: "कार्य अनुबंध", icon: HardHat, keywords: "works contract tender" },
  "24": { label: "Miscellaneous", hindi: "विविध", icon: Shapes, keywords: "affidavit company moa aoa award copy" },
  "25": { label: "Arms Licence", hindi: "शस्त्र लाइसेंस", icon: Target, keywords: "arms licence weapon gun" },
  "26": { label: "Ships & Vessels", hindi: "जहाज़", icon: Ship, keywords: "ship bottomry charter" },
  R1: { label: "Registration Services", hindi: "पंजीयन सेवाएं", icon: Stamp, keywords: "home visit attendance copy folio custody nurse" },
  R2: { label: "Applications", hindi: "आवेदन", icon: FileInput, keywords: "application process" },
  R3: { label: "Appeals & Petitions", hindi: "अपील", icon: Scale, keywords: "appeal petition holiday urgency" },
};

export const headMeta = (head: string): HeadMeta =>
  HEAD_META[head] ?? { label: head, icon: FileText };

/** One entry per head, in Fees Master order. */
export const HEADS = Array.from(new Set(INSTRUMENTS.map((i) => i.head))).map((head) => ({
  head,
  count: INSTRUMENTS.filter((i) => i.head === head).length,
  ...headMeta(head),
}));

/** Common requests at a deed-writer's desk. */
export const QUICK_PICKS: { id: string; label: string }[] = [
  { id: "S2", label: "Sale deed" },
  { id: "S51", label: "Rent / lease" },
  { id: "S193", label: "Mortgage" },
  { id: "S119", label: "Gift deed" },
  { id: "S223", label: "Agreement to sell" },
  { id: "S158", label: "Release (ancestral)" },
  { id: "S177", label: "Partition" },
  { id: "S219", label: "Power of attorney" },
];

/**
 * Common add-on fees a client may also need with a registration (pp. 22-23).
 */
export const ADD_ONS: { id: string; label: string }[] = [
  { id: "R19", label: "Home visit — within the Sub-Registrar's area" },
  { id: "R20", label: "Home visit — elsewhere in Rajasthan" },
  { id: "R21", label: "Home visit — outside Rajasthan" },
  { id: "R16", label: "Visit — person physically unable to attend" },
  { id: "R22", label: "Nurse / female assistant to accompany" },
  { id: "R34", label: "Registration on a holiday (urgency)" },
  { id: "R25", label: "Registration by the Registrar" },
  { id: "R23", label: "Digitally signed copy download" },
  { id: "R24", label: "Certified copy of map" },
];

export const byId = (id: string | null | undefined): Instrument | undefined =>
  id ? INSTRUMENTS.find((i) => i.id === id) : undefined;

/** Readable title: "Gift in favour of family members › Gift in favour of brother". */
export function displayName(ins: Instrument) {
  const name = ins.name.replace(/^\(?[ivxlcdm\d]+[a-z.]*\)\s*/i, "").replace(/\s+-$/, "");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const haystacks = new Map<string, string>(
  INSTRUMENTS.map((i) => [
    i.id,
    `${i.name} ${i.group ?? ""} ${i.headName} ${headMeta(i.head).label} ${headMeta(i.head).keywords ?? ""} art ${i.article}`.toLowerCase(),
  ])
);

/** All query words must appear somewhere; shorter names rank first. */
export function searchInstruments(query: string, limit = 40): Instrument[] {
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9.()]+/)
    .filter((w) => w.length > 1);
  if (!words.length) return [];
  return INSTRUMENTS.filter((i) => {
    const h = haystacks.get(i.id)!;
    return words.every((w) => h.includes(w));
  })
    .sort((a, b) => {
      const an = a.name.toLowerCase();
      const bn = b.name.toLowerCase();
      const aHit = words.filter((w) => an.includes(w)).length;
      const bHit = words.filter((w) => bn.includes(w)).length;
      return bHit - aHit || an.length - bn.length;
    })
    .slice(0, limit);
}

export function instrumentsOf(head: string) {
  return INSTRUMENTS.filter((i) => i.head === head);
}

const compact = (n: number) =>
  n >= 1_00_00_000 ? `₹${+(n / 1_00_00_000).toFixed(2)}Cr` : n >= 1_00_000 ? `₹${+(n / 1_00_000).toFixed(2)}L` : `₹${n.toLocaleString("en-IN")}`;

/** Short label for a duty rule, e.g. "2.5%", "Nil", "₹500", "0.25% · max ₹15L". */
export function ruleBadge(rule: Rule): string {
  switch (rule.t) {
    case "nil":
      return "Nil";
    case "manual":
      return "Court-fee rate";
    case "fixed":
      return `${compact(rule.amt)}${rule.each ? ` / ${rule.each}` : ""}`;
    case "pct":
      return `${+rule.rate.toFixed(3)}%${rule.max !== undefined ? ` · max ${compact(rule.max)}` : ""}`;
    case "tele":
      return "Telescopic";
    case "ofSd":
      return `${rule.rate * 100}% of SD`;
    case "ofOrigSd":
      return `${rule.rate * 100}% of original`;
    case "diff":
      return "Difference";
    case "cashSlab":
      return `${compact(rule.per)} / ${compact(rule.slab)}`;
    case "sum":
      return "Cash + property";
  }
}

/** Sum of the fixed fees of the selected registration add-on services. */
export function addOnTotal(ids: string[]) {
  return ids.reduce((sum, id) => {
    const rule = byId(id)?.rf;
    return sum + (rule && rule.t === "fixed" ? rule.amt : 0);
  }, 0);
}
