"use client";

import * as React from "react";
import { useSpring, useTransform, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  prefix = "",
  className,
  duration = 0.5,
}: AnimatedNumberProps) {
  // Memoize spring config to avoid re-initialization on every render
  const springConfig = React.useMemo(
    () => ({
      stiffness: 100,
      damping: 30,
      duration: duration * 1000,
    }),
    [duration]
  );

  const spring = useSpring(value, springConfig);

  const display = useTransform(spring, (latest) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(latest)
  );

  React.useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span className={cn("tabular-nums", className)}>
      {prefix}
      <motion.span>{display}</motion.span>
    </motion.span>
  );
}
