"use client";

import * as React from "react";
import { useRecurring } from "@/hooks/use-recurring";
import type { RecurringRule } from "@/hooks/use-recurring";
import { useSpaces } from "@/hooks/use-spaces";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecurringRuleList } from "@/components/recurring/recurring-rule-list";
import { CreateRecurringRuleModal } from "@/components/recurring/create-recurring-rule-modal";
import { EditRecurringRuleModal } from "@/components/recurring/edit-recurring-rule-modal";
import { RecurringEmptyState } from "@/components/recurring/recurring-empty-state";
import { RecurringSkeleton } from "@/components/recurring/recurring-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { NoActiveSpace } from "@/components/ui/no-active-space";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

export default function RecurringPage() {
  const {
    activeSpaceId,
    isLoading: spacesLoading,
    isError: spacesError,
    refetchSpaces,
  } = useSpaces();
  const {
    rules,
    isPending,
    isError,
    refetchRules,
    createRule,
    updateRule,
    deleteRule,
    toggleActive,
    isCreating,
    isUpdating,
  } = useRecurring();

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editRule, setEditRule] = React.useState<RecurringRule | null>(null);
  const [ruleToDelete, setRuleToDelete] = React.useState<RecurringRule | null>(null);

  if (spacesError) {
    return <ErrorState message="Couldn't load your spaces." onRetry={refetchSpaces} />;
  }
  if (spacesLoading) return <RecurringSkeleton />;
  if (!activeSpaceId) return <NoActiveSpace />;
  if (isPending) return <RecurringSkeleton />;
  if (isError) return <ErrorState onRetry={refetchRules} />;

  return (
    <div className="space-y-6 pb-safe">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Recurring Rules</h2>
          <p className="text-sm text-text-secondary">
            Amounts applied to your balances on a schedule.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Rule
        </Button>
      </div>

      {!rules.length ? (
        <RecurringEmptyState onCreate={() => setIsCreateOpen(true)} />
      ) : (
        <RecurringRuleList
          rules={rules}
          onEdit={setEditRule}
          onDelete={setRuleToDelete}
          onToggleActive={(rule) => toggleActive({ id: rule.id, isActive: !rule.isActive })}
        />
      )}

      <CreateRecurringRuleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={async (payload) => {
          await createRule({ ...payload, spaceId: activeSpaceId || "" });
        }}
        isCreating={isCreating}
      />

      <EditRecurringRuleModal
        key={editRule?.id ?? "none"}
        rule={editRule}
        onClose={() => setEditRule(null)}
        onUpdate={async (id, payload) => {
          await updateRule({ id, ...payload });
        }}
        isUpdating={isUpdating}
      />

      <DeleteConfirmationModal
        isOpen={!!ruleToDelete}
        onClose={() => setRuleToDelete(null)}
        onConfirm={async () => {
          if (ruleToDelete) await deleteRule(ruleToDelete.id);
        }}
        title="Delete recurring rule?"
        description={`This will remove "${ruleToDelete?.description ?? ""}" and stop applying it to your balances.`}
        confirmLabel="Delete"
      />
    </div>
  );
}