"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToastStore } from "@/components/ui/toast";

interface ExportButtonProps {
  spaceId: string | null;
}

export function ExportButton({ spaceId }: ExportButtonProps) {
  const { addToast } = useToastStore();

  const handleExport = React.useCallback(() => {
    if (!spaceId) {
      addToast("No active space selected", "error");
      return;
    }
    window.open(`/api/export?spaceId=${spaceId}`, "_blank");
  }, [spaceId, addToast]);

  return (
    <Button variant="ghost" size="sm" onClick={handleExport} className="shrink-0">
      <Download className="h-4 w-4 mr-1.5" />
      Export
    </Button>
  );
}
