import { Stamp } from "lucide-react";

export function BrandMark({ subtitleClassName = "text-slate-500" }: { subtitleClassName?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-600/25">
        <Stamp className="h-5 w-5" />
      </div>
      <div>
        <p className="font-poppins text-base font-extrabold leading-tight text-slate-900 sm:text-lg">
          Mortgage &amp; Loan Duty
        </p>
        <p className={`font-inter text-xs ${subtitleClassName}`}>Rajasthan Statutory Calculator</p>
      </div>
    </div>
  );
}
