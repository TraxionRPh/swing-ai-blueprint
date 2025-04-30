
import React from "react";
import { Loader2 } from "lucide-react";

interface HoleSavingIndicatorProps {
  isSaving: boolean;
  message?: string;
}

export const HoleSavingIndicator = ({ isSaving, message = "Saving..." }: HoleSavingIndicatorProps) => {
  if (!isSaving) return null;
  
  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in fade-in">
      <div className="flex items-center bg-primary/10 text-primary px-3 py-2 rounded-md shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};
