import { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { inr } from "../lib/stampDuty";

/** Spring-interpolated rupee amount; screen readers get the settled value. */
export function AnimatedAmount({
  value,
  className,
  as = "p",
}: {
  value: number;
  className?: string;
  as?: "p" | "span";
}) {
  const spring = useSpring(value, { stiffness: 260, damping: 32, mass: 0.6, restDelta: 0.5, restSpeed: 5 });
  const display = useTransform(spring, (v) => inr(Math.round(v)));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const Tag = as;
  return (
    <Tag className={className}>
      <motion.span aria-hidden>{display}</motion.span>
      <span className="sr-only">{inr(value)}</span>
    </Tag>
  );
}
