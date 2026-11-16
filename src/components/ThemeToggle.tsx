import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/useTheme";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line bg-surface text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ y: 18, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -18, rotate: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="flex"
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
