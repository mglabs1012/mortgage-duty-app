import { motion, type HTMLMotionProps } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Fades + lifts its children into view once, the first time they scroll on screen. */
export function Reveal({
  delay = 0,
  y = 18,
  className,
  children,
  ...rest
}: { delay?: number; y?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.55, ease, delay }}
      className={`print-plain ${className ?? ""}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
