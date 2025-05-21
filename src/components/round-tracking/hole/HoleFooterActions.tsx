
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ChevronRight } from "lucide-react";

interface HoleFooterActionsProps {
  isSaving: boolean;
  currentHole: number;
  holeCount: number;
  hasScore: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const HoleFooterActions = ({
  isSaving,
  currentHole,
  holeCount,
  hasScore,
  onCancel,
  onSave
}: HoleFooterActionsProps) => {
  return (
    <div className="flex justify-center w-full gap-4">
      <Button 
        variant="outline" 
        onClick={onCancel}
        className="min-w-[120px]"
      >
        {currentHole === 1 ? "Cancel Round" : "Previous Hole"}
      </Button>
      <Button 
        onClick={onSave} 
        disabled={isSaving || !hasScore}
        className="min-w-[120px]"
      >
        {isSaving ? (
          <Loading size="sm" message="Saving..." inline />
        ) : currentHole === holeCount ? (
          "Review Round"
        ) : (
          <span className="flex items-center">
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  );
};
