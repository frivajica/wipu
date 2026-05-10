"use client";

import { motion } from "framer-motion";
import { useLedger } from "@/hooks/use-ledger";
import { formatCurrency } from "@/lib/formatting";
import { SPRING_GENTLE } from "@/lib/animations";

export function DebtBalanceHeader() {
  const { balances } = useLedger();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_GENTLE}
      className="rounded-2xl bg-gradient-to-br from-debt to-debt-light p-5 sm:p-6 text-white shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">Total Debt</p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight">
            {formatCurrency(balances.totalDebt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-white/80 mb-1">Real Balance</p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight">
            {formatCurrency(balances.realBalance)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
