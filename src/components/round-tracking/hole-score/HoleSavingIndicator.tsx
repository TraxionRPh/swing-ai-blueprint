
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface HoleSavingIndicatorProps {
  isSaving?: boolean;
  saveError?: string | null;
  saveSuccess?: boolean;
}

export const HoleSavingIndicator = ({ 
  isSaving = false, 
  saveError = null,
  saveSuccess = false
}: HoleSavingIndicatorProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Handle success animation timing
  useEffect(() => {
    if (saveSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);
  
  if (!isSaving && !saveError && !showSuccess) return null;
  
  return (
    <div className={cn(
      "flex items-center justify-center p-2 mt-4 rounded-md transition-all duration-300 animate-in fade-in",
      isSaving ? "bg-amber-50 text-amber-700" : 
      saveError ? "bg-red-50 text-red-700" : 
      "bg-green-50 text-green-700"
    )}>
      {isSaving && (
        <>
          <Loader2 className="animate-spin h-4 w-4 mr-2 text-amber-600" />
          <span className="text-sm">Saving your score...</span>
        </>
      )}
      
      {saveError && (
        <>
          <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
          <span className="text-sm">{saveError || "Error saving score"}</span>
        </>
      )}
      
      {showSuccess && !isSaving && !saveError && (
        <>
          <Check className="h-4 w-4 mr-2 text-green-600" />
          <span className="text-sm">Score saved successfully</span>
        </>
      )}
    </div>
  );
};
