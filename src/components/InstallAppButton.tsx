import { AnimatePresence, motion } from "motion/react";
import { Download, ExternalLink } from "lucide-react";
import { usePwaInstall } from "../lib/usePwaInstall";

export function InstallAppButton() {
  const { canInstall, canOpen, promptInstall, openApp } = usePwaInstall();

  return (
    <AnimatePresence initial={false}>
      {canOpen ? (
        <motion.button
          key="open"
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileTap={{ scale: 0.94 }}
          onClick={openApp}
          aria-label="Open app"
          className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Open app</span>
        </motion.button>
      ) : canInstall ? (
        <motion.button
          key="install"
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileTap={{ scale: 0.94 }}
          onClick={promptInstall}
          aria-label="Install app"
          className="relative flex h-9 items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 px-3 text-xs font-semibold text-white shadow-[0_6px_16px_-6px_rgb(5_150_105/0.7)] transition hover:brightness-110"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/35 to-transparent"
          />
          <Download className="relative h-3.5 w-3.5" />
          <span className="relative hidden md:inline">Install</span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
