"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NoActiveSpace() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl border border-border/50 shadow-card text-center py-12 px-6"
    >
      <FolderOpen className="h-10 w-10 text-text-tertiary/60 mx-auto mb-4" />
      <p className="text-text-secondary mb-5 font-medium">
        No active space. Create or join a space to get started.
      </p>
      <Link href="/spaces">
        <Button variant="secondary">Go to Spaces</Button>
      </Link>
    </motion.div>
  );
}
