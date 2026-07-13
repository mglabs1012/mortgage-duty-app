import { Rocket, Sparkles, WifiOff, Search, Palette } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type UpdateEntry = {
  date: string; // ISO, for the <time> element
  label: string; // human-readable date
  tag: string;
  icon: LucideIcon;
  title: string;
  body: string;
};

export const UPDATES: UpdateEntry[] = [
  {
    date: "2026-07-13",
    label: "13 Jul 2026",
    tag: "Feature",
    icon: Sparkles,
    title: "This Updates page",
    body: "Added a proper home for release notes, reachable from the Updates button on the calculator, so changes to rates, features, and design are easy to track over time.",
  },
  {
    date: "2026-07-07",
    label: "7 Jul 2026",
    tag: "Design",
    icon: Palette,
    title: "New brand identity",
    body: "Replaced the placeholder icon set with our own logo across the browser tab, home-screen icon, and social share previews, and gave the FAQ section a cleaner look.",
  },
  {
    date: "2026-07-07",
    label: "7 Jul 2026",
    tag: "SEO",
    icon: Search,
    title: "Improved search visibility",
    body: "Added structured data, Open Graph previews, a sitemap, and an FAQ section covering stamp duty rates, surcharges, and registration fees — so answers show up directly in search results.",
  },
  {
    date: "2026-07-07",
    label: "7 Jul 2026",
    tag: "PWA",
    icon: WifiOff,
    title: "Now installable as an app",
    body: "Add the calculator to your home screen and open it offline like a native app — no browser tabs, no app store required.",
  },
  {
    date: "2026-06-19",
    label: "19 Jun 2026",
    tag: "Launch",
    icon: Rocket,
    title: "Rajasthan Stamp Duty Calculator launches",
    body: "First release: instant stamp duty, surcharge, registration fee, and CSI charge calculations for mortgage and loan deeds, aligned with the Rajasthan e-GRAS schedule.",
  },
];
