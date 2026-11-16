/**
 * Fixed, purely decorative backdrop: two slow-drifting colour fields and a
 * faded dot grid. Uses transform-only CSS animation (GPU friendly) and is
 * hidden from print and assistive tech.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="no-print pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="bg-grid absolute inset-0 opacity-60"
        style={{
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <div className="absolute -top-40 left-[8%] h-[28rem] w-[28rem] animate-float-slow rounded-full bg-brand-400/20 blur-[100px] will-change-transform dark:bg-brand-500/20" />
      <div className="absolute -top-24 right-[4%] h-[24rem] w-[24rem] animate-float-slower rounded-full bg-sky-300/25 blur-[100px] will-change-transform dark:bg-indigo-500/15" />
      <div className="absolute top-[45%] -left-32 h-[22rem] w-[22rem] animate-float-slower rounded-full bg-amber-200/20 blur-[110px] will-change-transform dark:bg-cyan-500/[0.07]" />
    </div>
  );
}
