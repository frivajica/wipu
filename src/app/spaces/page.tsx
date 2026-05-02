"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSpaces } from "@/hooks/use-spaces";
import { SpaceCard } from "@/components/spaces/space-card";
import { CreateSpaceModal } from "@/components/spaces/create-space-modal";
import { InviteLinkModal } from "@/components/spaces/invite-link-modal";
import { SpaceModals } from "@/components/spaces/space-modals";
import { SpacesSkeleton } from "@/components/spaces/spaces-skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Space } from "@/lib/types";
import { motion } from "framer-motion";

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
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold font-display text-text-primary">Your Spaces</h1>
              <p className="text-text-secondary mt-1">Manage your teams and workspaces</p>
            </div>
          </div>
          <SpacesSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary">Your Spaces</h1>
            <p className="text-text-secondary mt-1">Manage your teams and workspaces</p>
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
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            className="grid gap-4 md:grid-cols-2"
          >
            {spaces.map((space) => (
              <motion.div
                key={space.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 400, damping: 30 } },
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

      <SpaceModals
        deleteTarget={deleteTarget}
        leaveTarget={leaveTarget}
        onCloseDelete={() => setDeleteTarget(null)}
        onCloseLeave={() => setLeaveTarget(null)}
        onConfirmDelete={async () => { if (deleteTarget) await deleteSpace(deleteTarget.id); }}
        onConfirmLeave={async () => { if (leaveTarget) await leaveSpace(leaveTarget.id); }}
      />
    </div>
  );
}
