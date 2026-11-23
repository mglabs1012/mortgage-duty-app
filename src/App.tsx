import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Calculator from "./pages/Calculator";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { AmbientBackground } from "./components/AmbientBackground";

const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const StampDutyPage = lazy(() => import("./stamp/StampDutyPage"));

const ease = [0.22, 1, 0.36, 1] as const;

const pageVariants = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease },
    // A leftover filter/transform would turn <main> into the containing block
    // for position:fixed children (progress bar, mobile total bar).
    transitionEnd: { filter: "none", transform: "none" },
  },
  exit: { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.2, ease } },
};

/** Scroll to top on route change, but let in-page #hash links scroll themselves. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function PageFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-3" />
      <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded bg-surface-3" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-3xl bg-surface-2" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <div className="relative flex min-h-screen flex-col overflow-x-clip">
        <AmbientBackground />
        <SiteHeader />
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="print-plain relative z-10 flex-1"
          >
            <Suspense fallback={<PageFallback />}>
              <Routes location={location}>
                <Route path="/" element={<Calculator />} />
                <Route path="/stamp-duty" element={<StampDutyPage />} />
                <Route path="/blog" element={<BlogIndex />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/updates" element={<Navigate to="/blog" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </motion.main>
        </AnimatePresence>
        <SiteFooter />
      </div>
    </MotionConfig>
  );
}
