"use client";

import { LedgerItem } from "@/lib/types";
import { LedgerRowDesktop } from "./ledger-row-desktop";
import { LedgerRowMobile } from "./ledger-row-mobile";

interface LedgerRowProps {
  item: LedgerItem;
  userName: string;
  onEdit: (item: LedgerItem) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  isEditing?: boolean;
  onStartEdit?: () => void;
  isOwned?: boolean;
}

export function LedgerRow({
  item,
  userName,
  onEdit,
  onDelete,
  dragHandleProps,
  isDragging,
  isEditing,
  onStartEdit,
  isOwned,
}: LedgerRowProps) {
  const sharedProps = {
    item,
    userName,
    onEdit,
    onDelete,
    dragHandleProps,
    isDragging,
    isEditing,
    onStartEdit,
    isOwned,
  };

  return (
    <>
      <LedgerRowMobile {...sharedProps} />
      <LedgerRowDesktop {...sharedProps} />
    </>
  );
}
