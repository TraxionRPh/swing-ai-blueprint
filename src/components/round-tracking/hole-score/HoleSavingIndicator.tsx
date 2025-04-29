
import React from "react";
import { Loader2 } from "lucide-react";

interface HoleSavingIndicatorProps {
  isSaving: boolean;
}

export const HoleSavingIndicator = ({ isSaving }: HoleSavingIndicatorProps) => {
  if (!isSaving) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center bg-primary/10 text-primary px-3 py-2 rounded-md">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm font-medium">Saving...</span>
      </div>
    </div>
  );
};
