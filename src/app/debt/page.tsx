"use client";

import { useAuth } from "@/hooks/use-auth";
import { useLedger } from "@/hooks/use-ledger";
import { useSpaces } from "@/hooks/use-spaces";
import { DebtBalanceHeader } from "@/components/debt/debt-balance-header";
import { DebtGroupList } from "@/components/debt/debt-group-list";
import { DebtEmptyState } from "@/components/debt/debt-empty-state";
import { DebtSkeleton } from "@/components/debt/debt-skeleton";
import { useDebt } from "@/hooks/use-debt";

export default function DebtPage() {
  return (
    <div className="space-y-6">
      <DebtBalanceHeader />
      <DebtContent />
    </div>
  );
}

function DebtContent() {
  const { user } = useAuth();
  const { activeSpaceId } = useSpaces();
  const { groups, isLoading } = useDebt();
  const { updateItem, deleteItem, reorderItems } = useLedger();

  if (isLoading) return <DebtSkeleton />;
  if (!groups.length) return <DebtEmptyState />;

  const handleEdit = async (item: { id: string; amount: number; description: string; category: string; date: string; updatedBy: string }) => {
    await updateItem({
      id: item.id,
      updates: {
        amount: item.amount,
        description: item.description,
        category: item.category,
        date: item.date,
        updatedBy: item.updatedBy,
      },
    });
  };

  const handleReorder = (itemIds: string[]) => {
    if (!activeSpaceId) return;
    reorderItems({ spaceId: activeSpaceId, itemIds });
  };

  return (
    <DebtGroupList
      groups={groups}
      currentUserId={user?.id || ""}
      onEditItem={handleEdit}
      onDeleteItem={deleteItem}
      onReorderItems={handleReorder}
    />
  );
}
