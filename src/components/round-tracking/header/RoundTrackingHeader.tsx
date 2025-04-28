
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface RoundTrackingHeaderProps {
  onBack: () => void;
  hideBackButton?: boolean;
}

export const RoundTrackingHeader = ({ onBack, hideBackButton = false }: RoundTrackingHeaderProps) => {
  return (
    <div className="flex items-center space-x-4">
      {!hideBackButton && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBack}
          className="text-muted-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Round Tracking</h1>
        <p className="text-muted-foreground">
          Track your round hole by hole
        </p>
      </div>
    </div>
  );
};
