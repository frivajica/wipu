"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLedger } from "@/hooks/use-ledger";
import { useSpaces } from "@/hooks/use-spaces";
import { useDebt } from "@/hooks/use-debt";
import { DebtBalanceBar } from "@/components/debt/debt-balance-bar";
import { DebtGroupList } from "@/components/debt/debt-group-list";
import { DebtEmptyState } from "@/components/debt/debt-empty-state";
import { DebtSkeleton } from "@/components/debt/debt-skeleton";
import { CreateDebtGroupModal } from "@/components/debt/create-debt-group-modal";
import { ErrorState } from "@/components/ui/error-state";
import { NoActiveSpace } from "@/components/ui/no-active-space";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DebtPage() {
  return (
    <div className="space-y-6">
      <DebtContent />
    </div>
  );
}

function DebtContent() {
  const { user } = useAuth();
  const {
    activeSpaceId,
    isLoading: spacesLoading,
    isError: spacesError,
    refetchSpaces,
  } = useSpaces();
  const {
    groups,
    isPending,
    isError,
    refetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    isCreating,
  } = useDebt();
  const { updateItem, deleteItem, reorderItems } = useLedger();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleCreate = async (name: string) => {
    await createGroup(name);
  };

  if (spacesError) {
    return <ErrorState message="Couldn't load your spaces." onRetry={refetchSpaces} />;
  }
  if (spacesLoading) return <DebtSkeleton />;
  if (!activeSpaceId) return <NoActiveSpace />;
  if (isPending) return <DebtSkeleton />;
  if (isError) return <ErrorState onRetry={refetchGroups} />;

  return (
    <>
      <DebtBalanceBar />
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
          onUpdateGroup={async (id, name) => {
            await updateGroup({ id, name });
          }}
          onDeleteGroup={deleteGroup}
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
