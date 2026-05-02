"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const shakeVariants = {
  shake: {
    x: [-4, 4, -4, 4, 0],
    transition: { duration: 0.3 },
  },
};

export function LoginForm() {
  const router = useRouter();
  const { login, isLoginLoading, loginError } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/ledger");
      }, 400);
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-text-primary">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-text-primary">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <AnimatePresence mode="wait">
        {loginError && (
          <motion.p
            key="error"
            variants={shakeVariants}
            animate="shake"
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-error"
          >
            {loginError.message}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        animate={showSuccess ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Button
          type="submit"
          className="w-full"
          isLoading={isLoginLoading}
        >
          Sign In
        </Button>
      </motion.div>

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary-accent hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
