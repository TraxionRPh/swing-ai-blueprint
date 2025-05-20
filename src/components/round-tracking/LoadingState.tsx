
import { Loader2 } from "lucide-react";
import { RoundHeader } from "./RoundHeader";

interface LoadingStateProps {
  message?: string;
  onBack?: () => void;
}

export const LoadingState = ({ message = "Loading...", onBack }: LoadingStateProps) => {
  return (
    <div className="space-y-6">
      <RoundHeader 
        title="Round Tracking" 
        subtitle="Loading your round data" 
        onBack={onBack}
      />
      
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
