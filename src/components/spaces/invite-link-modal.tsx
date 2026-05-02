"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToastStore } from "@/components/ui/toast";

interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
}

export function InviteLinkModal({ isOpen, onClose, inviteCode }: InviteLinkModalProps) {
  const [copied, setCopied] = React.useState(false);
  const { addToast } = useToastStore();
  const inviteLink = `https://wipu.app/join/${inviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      addToast("Invite link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast("Failed to copy link", "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Members">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Share this link with others to invite them to your space:
        </p>
        <div className="flex items-center gap-2">
          <motion.input
            type="text"
            value={inviteLink}
            readOnly
            animate={copied ? { backgroundColor: ["#f1f5f9", "#dcfce7", "#f1f5f9"] } : {}}
            transition={{ duration: 0.6 }}
            className="flex-1 h-10 rounded-lg border border-border bg-surface-elevated px-3 text-sm text-text-secondary"
          />
          <motion.div
            animate={copied ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </div>
        <p className="text-xs text-text-secondary">
          Maximum 8 members per space
        </p>
      </div>
    </Modal>
  );
}
