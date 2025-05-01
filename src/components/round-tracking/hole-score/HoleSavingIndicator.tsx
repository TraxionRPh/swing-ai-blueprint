
import { Loader2 } from "lucide-react";

interface HoleSavingIndicatorProps {
  isSaving?: boolean;
}

export const HoleSavingIndicator = ({ isSaving = false }: HoleSavingIndicatorProps) => {
  if (!isSaving) return null;
  
  return (
    <div className="flex items-center justify-center p-2 mt-4 bg-amber-50 rounded-md">
      <Loader2 className="animate-spin h-4 w-4 mr-2 text-amber-600" />
      <span className="text-sm text-amber-700">Saving your score...</span>
    </div>
  );
};
