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
      className="rounded-2xl bg-gradient-to-br from-debt to-debt-light p-6 text-white shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">Total Debt</p>
          <p className="text-3xl font-bold">
            {formatCurrency(balances.totalDebt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-white/80">Real Balance</p>
          <p className="text-3xl font-bold">
            {formatCurrency(balances.realBalance)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
