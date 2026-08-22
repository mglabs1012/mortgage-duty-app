import { APP_VERSION } from "../lib/version";

export function SiteFooter() {
  return (
    <>
      <p>
        &copy; {new Date().getFullYear()} Rajasthan Stamp Duty Calculator. All rights reserved.
      </p>
      <p className="mt-0.5">
        Developed by <span className="font-semibold text-slate-500">MG Labs</span>
        <span className="mx-1.5 text-slate-300">·</span>
        <span className="tabular-nums">v{APP_VERSION}</span>
      </p>
    </>
  );
}
