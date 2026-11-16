import { IndianRupee } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 via-brand-700 to-brand-900 text-white shadow-[0_6px_16px_-6px_rgb(31_67_133/0.7)] ring-1 ring-white/15">
        <span
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.35),transparent_55%)]"
        />
        <IndianRupee className="relative h-[18px] w-[18px]" strokeWidth={2.5} />
      </div>
      <div className="leading-none">
        <p className="font-display text-[15px] font-extrabold tracking-tight text-ink sm:text-base">
          Mortgage <span className="text-accent">&amp;</span> Loan Duty
        </p>
        {!compact && (
          <p className="mt-1 hidden text-[11px] font-medium text-muted sm:block">
            Rajasthan Statutory Calculator
          </p>
        )}
      </div>
    </div>
  );
}
