"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSpaces } from "@/hooks/use-spaces";
import { SpaceCard } from "@/components/spaces/space-card";
import { CreateSpaceModal } from "@/components/spaces/create-space-modal";
import { InviteLinkModal } from "@/components/spaces/invite-link-modal";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Space } from "@/lib/types";

export default function SpacesPage() {
  const router = useRouter();
  const { spaces, isLoading, createSpace, deleteSpace, leaveSpace, switchSpace } = useSpaces();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedSpace, setSelectedSpace] = React.useState<Space | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [leaveTarget, setLeaveTarget] = React.useState<{ id: string; name: string } | null>(null);

  const handleSpaceClick = (spaceId: string) => {
    switchSpace(spaceId);
    router.push("/ledger");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary">
              Your Spaces
            </h1>
            <p className="text-text-secondary mt-1">
              Manage your teams and workspaces
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Space
          </Button>
        </div>

        {spaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No spaces yet. Create one to get started!</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            {spaces.map((space) => (
              <motion.div
                key={space.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
                }}
              >
                <SpaceCard
                  space={space}
                  onDelete={(id) => setDeleteTarget({ id, name: space.name })}
                  onLeave={(id) => setLeaveTarget({ id, name: space.name })}
                  onInvite={(space) => setSelectedSpace(space)}
                  onClick={() => handleSpaceClick(space.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <CreateSpaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createSpace}
        isCreating={false}
      />

      {selectedSpace && (
        <InviteLinkModal
          isOpen={!!selectedSpace}
          onClose={() => setSelectedSpace(null)}
          inviteCode={selectedSpace.inviteCode}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await deleteSpace(deleteTarget.id);
        }}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This space and all its ledger data will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete Space"
      />

      <DeleteConfirmationModal
        isOpen={!!leaveTarget}
        onClose={() => setLeaveTarget(null)}
        onConfirm={async () => {
          if (leaveTarget) await leaveSpace(leaveTarget.id);
        }}
        title={`Leave "${leaveTarget?.name}"?`}
        description="You will lose access to this space and its ledger data. This action cannot be undone."
        confirmLabel="Leave Space"
        confirmVariant="primary"
      />
    </div>
  );
}
