import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { BookOpen, Calculator } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";
import { InstallAppButton } from "./InstallAppButton";

const NAV = [
  { to: "/", label: "Calculator", icon: Calculator, match: (p: string) => p === "/" },
  { to: "/blog", label: "Blog", icon: BookOpen, match: (p: string) => p.startsWith("/blog") },
];

export function SiteHeader() {
  const { pathname } = useLocation();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 8;
    if (next !== scrolled) setScrolled(next);
  });

  return (
    <header className="no-print sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className={`glass mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-2xl border px-2.5 py-2 transition-[box-shadow,border-color,background-color] duration-300 sm:px-3 ${
          scrolled
            ? "border-line-strong shadow-[0_10px_30px_-12px_hsl(var(--shadow-color)/0.25)]"
            : "border-line shadow-none"
        }`}
      >
        <Link to="/" aria-label="Home" className="rounded-xl pr-1">
          <BrandMark />
        </Link>

        <div className="flex items-center gap-1.5">
          <nav
            aria-label="Primary"
            className="flex items-center gap-0.5 rounded-full border border-line bg-surface-2/70 p-0.5"
          >
            {NAV.map(({ to, label, icon: Icon, match }) => {
              const active = match(pathname);
              return (
                <NavLink
                  key={to}
                  to={to}
                  aria-label={label}
                  className={`relative flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors sm:px-3.5 ${
                    active ? "text-white" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-b from-brand-500 to-brand-700 shadow-[0_4px_12px_-4px_rgb(31_67_133/0.6)]"
                    />
                  )}
                  <Icon className="relative h-3.5 w-3.5" />
                  <span className="relative hidden sm:inline">{label}</span>
                </NavLink>
              );
            })}
          </nav>
          <InstallAppButton />
          <ThemeToggle />
        </div>
      </motion.div>
    </header>
  );
}
