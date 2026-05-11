"use client";

import { motion } from "framer-motion";
import { DebtGroup, LedgerItem } from "@/lib/types";
import { DebtGroupCard } from "./debt-group-card";
import { SPRING_DEFAULT } from "@/lib/animations";

interface DebtGroupListProps {
  groups: DebtGroup[];
  currentUserId: string;
  onEditItem: (item: LedgerItem) => void;
  onDeleteItem: (id: string) => void;
  onReorderItems: (itemIds: string[]) => void;
  onUpdateGroup: (id: string, name: string) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
}

export function DebtGroupList({
  groups,
  currentUserId,
  onEditItem,
  onDeleteItem,
  onReorderItems,
  onUpdateGroup,
  onDeleteGroup,
}: DebtGroupListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((group, index) => (
        <motion.div
          key={group.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...SPRING_DEFAULT,
            delay: index * 0.05,
          }}
        >
          <DebtGroupCard
            group={group}
            currentUserId={currentUserId}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            onReorderItems={onReorderItems}
            onUpdateGroup={onUpdateGroup}
            onDeleteGroup={onDeleteGroup}
          />
        </motion.div>
      ))}
    </div>
  );
}
