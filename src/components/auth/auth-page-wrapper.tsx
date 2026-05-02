"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 30 },
  },
};

interface AuthPageWrapperProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthPageWrapper({ title, subtitle, children }: AuthPageWrapperProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-2xl font-bold font-display text-text-primary">{title}</h1>
        <p className="text-text-secondary mt-1">{subtitle}</p>
      </motion.div>
      <motion.div variants={itemVariants}>{children}</motion.div>
    </motion.div>
  );
}
