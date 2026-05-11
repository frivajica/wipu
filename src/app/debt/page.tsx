"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLedger } from "@/hooks/use-ledger";
import { useSpaces } from "@/hooks/use-spaces";
import { useDebt } from "@/hooks/use-debt";
import { DebtBalanceHeader } from "@/components/debt/debt-balance-header";
import { DebtGroupList } from "@/components/debt/debt-group-list";
import { DebtEmptyState } from "@/components/debt/debt-empty-state";
import { DebtSkeleton } from "@/components/debt/debt-skeleton";
import { CreateDebtGroupModal } from "@/components/debt/create-debt-group-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
  const { groups, isLoading, createGroup, isCreating } = useDebt();
  const { updateItem, deleteItem, reorderItems } = useLedger();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleCreate = async (name: string) => {
    await createGroup(name);
  };

  if (isLoading) return <DebtSkeleton />;

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Debt Groups</h2>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Group
        </Button>
      </div>

      {!groups.length ? (
        <DebtEmptyState onCreate={() => setIsModalOpen(true)} />
      ) : (
        <DebtGroupList
          groups={groups}
          currentUserId={user?.id || ""}
          onEditItem={async (item) => {
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
          }}
          onDeleteItem={deleteItem}
          onReorderItems={(itemIds) => {
            if (!activeSpaceId) return;
            reorderItems({ spaceId: activeSpaceId, itemIds });
          }}
        />
      )}

      <CreateDebtGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        isCreating={isCreating}
      />
    </>
  );
}
