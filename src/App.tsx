import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Calculator from "./pages/Calculator";

const Updates = lazy(() => import("./pages/Updates"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

const pageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.985, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -14, scale: 0.985, filter: "blur(4px)" },
};

const pageTransition = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.7 };

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Suspense fallback={null}>
          <Routes location={location}>
            <Route path="/" element={<Calculator />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
