"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSpaces } from "@/hooks/use-spaces";
import { SpaceCard } from "@/components/spaces/space-card";
import { CreateSpaceModal } from "@/components/spaces/create-space-modal";
import { InviteLinkModal } from "@/components/spaces/invite-link-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Space } from "@/lib/types";

export default function SpacesPage() {
  const router = useRouter();
  const { spaces, isLoading, createSpace, deleteSpace, leaveSpace, switchSpace } = useSpaces();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedSpace, setSelectedSpace] = React.useState<Space | null>(null);

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
          <div className="grid gap-4 md:grid-cols-2">
            {spaces.map((space) => (
              <div key={space.id} onClick={() => handleSpaceClick(space.id)} className="cursor-pointer">
                <SpaceCard
                  space={space}
                  onDelete={(id) => {
                    if (confirm("Are you sure you want to delete this space?")) {
                      deleteSpace(id);
                    }
                  }}
                  onLeave={(id) => {
                    if (confirm("Are you sure you want to leave this space?")) {
                      leaveSpace(id);
                    }
                  }}
                  onInvite={(space) => setSelectedSpace(space)}
                />
              </div>
            ))}
          </div>
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
    </div>
  );
}
