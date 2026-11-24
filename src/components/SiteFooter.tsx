import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { APP_VERSION } from "../lib/version";
import { BrandMark } from "./BrandMark";

// Kept static (not imported from data/posts) so article bodies stay out of the main bundle.
const FOOTER_GUIDES = [
  { slug: "rajasthan-mortgage-stamp-duty-calculator-2026", label: "Mortgage stamp duty 2026" },
  { slug: "msme-stamp-duty-concession-rajasthan", label: "MSME concession" },
  { slug: "pay-stamp-duty-online-egras-rajasthan", label: "Pay via e-GRAS" },
  { slug: "documents-required-mortgage-registration-rajasthan", label: "Documents checklist" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="no-print mt-16 border-t border-line bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <BrandMark />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Free, instant estimates of stamp duty, surcharges, registration fee and CSI charges for
            mortgage &amp; loan deeds in Rajasthan — aligned with e-GRAS.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-medium text-muted">
            <span className="h-1.5 w-1.5 animate-pulse-ring rounded-full bg-emerald-500" />
            Rates verified against e-GRAS · 2026
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink">Product</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/" className="text-muted transition-colors hover:text-ink">
                Mortgage duty calculator
              </Link>
            </li>
            <li>
              <Link to="/stamp-duty" className="text-muted transition-colors hover:text-ink">
                All-deeds stamp duty &amp; fees
              </Link>
            </li>
            <li>
              <Link to="/blog" className="text-muted transition-colors hover:text-ink">
                Blog &amp; guides
              </Link>
            </li>
            <li>
              <a
                href="https://egras.rajasthan.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
              >
                e-GRAS portal <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink">Popular guides</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {FOOTER_GUIDES.map((g) => (
              <li key={g.slug}>
                <Link to={`/blog/${g.slug}`} className="text-muted transition-colors hover:text-ink">
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {year} Rajasthan Stamp Duty Calculator. All rights reserved.</p>
          <p>
            Developed by <span className="font-semibold text-ink-2">MG Labs</span>
            <span className="mx-1.5 opacity-50">·</span>
            <span className="tabular-nums">v{APP_VERSION}</span>
            <span className="mx-1.5 opacity-50">·</span>
            Not a government website
          </p>
        </div>
      </div>
    </footer>
  );
}
