"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { RegisterForm } from "@/components/auth/register-form";

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

export default function RegisterPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-2xl font-bold font-display text-text-primary">
          Create account
        </h1>
        <p className="text-text-secondary mt-1">
          Start tracking with Wipu
        </p>
      </motion.div>
      <motion.div variants={itemVariants}>
        <RegisterForm />
      </motion.div>
    </motion.div>
  );
}
