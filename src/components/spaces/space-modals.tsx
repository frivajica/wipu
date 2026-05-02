"use client";

import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

interface SpaceModalsProps {
  deleteTarget: { id: string; name: string } | null;
  leaveTarget: { id: string; name: string } | null;
  onCloseDelete: () => void;
  onCloseLeave: () => void;
  onConfirmDelete: () => Promise<void>;
  onConfirmLeave: () => Promise<void>;
}

export function SpaceModals({
  deleteTarget,
  leaveTarget,
  onCloseDelete,
  onCloseLeave,
  onConfirmDelete,
  onConfirmLeave,
}: SpaceModalsProps) {
  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This space and all its ledger data will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete Space"
      />

      <DeleteConfirmationModal
        isOpen={!!leaveTarget}
        onClose={onCloseLeave}
        onConfirm={onConfirmLeave}
        title={`Leave "${leaveTarget?.name}"?`}
        description="You will lose access to this space and its ledger data. This action cannot be undone."
        confirmLabel="Leave Space"
        confirmVariant="primary"
      />
    </>
  );
}
