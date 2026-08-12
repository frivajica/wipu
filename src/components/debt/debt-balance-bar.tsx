"use client";

import { useLedger } from "@/hooks/use-ledger";
import { formatCurrency } from "@/lib/formatting";
import { BalanceBar } from "@/components/layout/balance-bar";

export function DebtBalanceBar() {
  const { balances, balancesPending } = useLedger();

  return (
    <BalanceBar>
      <div className="rounded-lg bg-surface-strong px-2.5 py-1 text-center">
        <p className="text-[9px] font-medium text-text-secondary uppercase tracking-wide">
          Total Debt
        </p>
        <p className="text-sm font-bold text-debt">
          {balancesPending ? "—" : formatCurrency(balances.totalDebt)}
        </p>
      </div>
      <div className="rounded-lg bg-surface-strong px-2.5 py-1 text-center">
        <p className="text-[9px] font-medium text-text-secondary uppercase tracking-wide">
          Real Balance
        </p>
        <p className="text-sm font-bold text-text">
          {balancesPending ? "—" : formatCurrency(balances.realBalance)}
        </p>
      </div>
    </BalanceBar>
  );
}
