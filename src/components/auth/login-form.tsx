"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AuthFormLayout } from "./auth-form-layout";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoginLoading, loginError } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      router.push("/ledger");
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <AuthFormLayout
      onSubmit={handleSubmit}
      error={loginError}
      isLoading={isLoginLoading}
      submitLabel="Sign In"
      footer={
        <p className="text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary-accent hover:underline">
            Create one
          </Link>
        </p>
      }
    >
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-text-primary">Email</label>
        <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-text-primary">Password</label>
        <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
    </AuthFormLayout>
  );
}
