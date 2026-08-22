import { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { inr } from "../lib/stampDuty";

export function AnimatedAmount({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 340, damping: 34, mass: 0.5 });
  const display = useTransform(spring, (v) => inr(Math.round(v)));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.p className={className}>{display}</motion.p>;
}
