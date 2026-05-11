"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const inviteCode = params.inviteCode as string;

  const [status, setStatus] = React.useState<"idle" | "joining" | "success" | "error">("idle");
  const [error, setError] = React.useState<string>("");

  const handleJoin = async () => {
    setStatus("joining");
    try {
      const res = await fetch("/api/spaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to join space");
      }

      setStatus("success");
      setTimeout(() => {
        router.push("/spaces");
      }, 1500);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-strong flex items-center justify-center">
            <Users className="h-8 w-8 text-primary-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-text-primary">Join a Space</h1>
            <p className="text-sm text-text-secondary">
              Please log in or create an account to join this space.
            </p>
          </div>
          <Button onClick={() => router.push("/login")} className="w-full">
            Go to Login
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-strong flex items-center justify-center">
          <Users className="h-8 w-8 text-primary-accent" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-text-primary">Join a Space</h1>
          <p className="text-sm text-text-secondary">
            You&apos;ve been invited to join a shared space.
          </p>
        </div>

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-3 text-sm text-success"
          >
            <Check className="h-4 w-4 shrink-0" />
            You joined the space! Redirecting...
          </motion.div>
        )}

        <Button
          onClick={handleJoin}
          disabled={status === "joining" || status === "success"}
          isLoading={status === "joining"}
          className="w-full"
        >
          {status === "success" ? "Joined" : "Join Space"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
