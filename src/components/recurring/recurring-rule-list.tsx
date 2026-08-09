"use client";

import { motion } from "framer-motion";
import { RecurringRule } from "@/hooks/use-recurring";
import { RecurringRuleCard } from "./recurring-rule-card";
import { SPRING_DEFAULT } from "@/lib/animations";

interface RecurringRuleListProps {
  rules: RecurringRule[];
  onEdit: (rule: RecurringRule) => void;
  onDelete: (rule: RecurringRule) => void;
  onToggleActive: (rule: RecurringRule) => void;
}

export function RecurringRuleList({
  rules,
  onEdit,
  onDelete,
  onToggleActive,
}: RecurringRuleListProps) {
  return (
    <div className="space-y-3">
      {rules.map((rule, index) => (
        <motion.div
          key={rule.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...SPRING_DEFAULT,
            delay: index * 0.04,
          }}
        >
          <RecurringRuleCard
            rule={rule}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        </motion.div>
      ))}
    </div>
  );
}