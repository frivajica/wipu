"use client";

import { useLedger } from "@/hooks/use-ledger";
import { formatCurrency } from "@/lib/formatting";

export function DebtBalanceBar() {
  const { balances } = useLedger();

  return (
    <div className="sticky top-15 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center justify-between gap-2">
        <div className="rounded-lg bg-surface-strong px-2.5 py-1 text-center">
          <p className="text-[9px] font-medium text-text-secondary uppercase tracking-wide">
            Total Debt
          </p>
          <p className="text-sm font-bold text-debt">
            {formatCurrency(balances.totalDebt)}
          </p>
        </div>
        <div className="rounded-lg bg-surface-strong px-2.5 py-1 text-center">
          <p className="text-[9px] font-medium text-text-secondary uppercase tracking-wide">
            Real Balance
          </p>
          <p className="text-sm font-bold text-text">
            {formatCurrency(balances.realBalance)}
          </p>
        </div>
      </div>
    </div>
  );
}
