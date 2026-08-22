import { motion } from "motion/react";
import { Download, ExternalLink } from "lucide-react";
import { usePwaInstall } from "../lib/usePwaInstall";

export function InstallAppButton() {
  const { canInstall, canOpen, promptInstall, openApp } = usePwaInstall();

  if (!canInstall && !canOpen) return null;

  if (canOpen) {
    return (
      <motion.button
        layout
        onClick={openApp}
        aria-label="Open app"
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-inter text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Open App</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      layout
      onClick={promptInstall}
      aria-label="Install app"
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 px-3 py-1.5 font-inter text-xs font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:from-emerald-600 hover:to-emerald-700"
    >
      <Download className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Install App</span>
    </motion.button>
  );
}
