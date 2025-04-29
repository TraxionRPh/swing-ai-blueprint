
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface HoleSavingIndicatorProps {
  isSaving: boolean;
}

export const HoleSavingIndicator = ({ isSaving }: HoleSavingIndicatorProps) => {
  // Add state to track stuck saving state
  const [showSaving, setShowSaving] = useState(false);
  const [stuckTimeout, setStuckTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Use an effect to add a delay before showing the saving indicator
  // and also to handle stuck states with a timeout (force hide after 8 seconds)
  useEffect(() => {
    if (isSaving) {
      // Add a small delay before showing saving indicator to prevent flashing
      const timer = setTimeout(() => {
        setShowSaving(true);
        
        // Set a timeout to automatically hide the indicator after 8 seconds
        // This prevents it from getting stuck permanently
        const stuck = setTimeout(() => {
          console.log("Saving indicator timed out after 8 seconds");
          setShowSaving(false);
        }, 8000);
        
        setStuckTimeout(stuck);
      }, 500);
      
      return () => {
        clearTimeout(timer);
        if (stuckTimeout) clearTimeout(stuckTimeout);
      };
    } else {
      setShowSaving(false);
      if (stuckTimeout) clearTimeout(stuckTimeout);
    }
  }, [isSaving]);
  
  if (!showSaving) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center bg-primary/10 text-primary px-3 py-2 rounded-md">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm font-medium">Saving...</span>
      </div>
    </div>
  );
};
