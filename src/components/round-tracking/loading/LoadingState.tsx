
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface LoadingStateProps {
  onBack: () => void;
}

export const LoadingState = ({ onBack }: LoadingStateProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBack}
          className="text-muted-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Round Tracking</h1>
      </div>
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading round data...</p>
      </div>
    </div>
  );
};
