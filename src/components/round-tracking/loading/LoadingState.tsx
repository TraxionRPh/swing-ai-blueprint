
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ReactNode } from "react";

interface LoadingStateProps {
  onBack: () => void;
  children?: ReactNode;
  hideHeader?: boolean;
  message?: string;
  retryFn?: () => void;
  roundId?: string;
  error?: string;
}

export const LoadingState = ({ 
  onBack, 
  children, 
  hideHeader = false, 
  message = "Loading round data...",
  retryFn,
  roundId,
  error
}: LoadingStateProps) => {
  // Create display message with round ID if available
  const displayMessage = roundId 
    ? `${message} (Round ID: ${roundId.substring(0, 8)}...)` 
    : message;
  
  return (
    <div className="space-y-6 w-full">
      {!hideHeader && (
        <div className="flex items-center space-x-4 mb-6">
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
      )}
      
      <div className="w-full flex justify-center">
        <Loading message={displayMessage} />
      </div>
      
      {error && retryFn && (
        <div className="mt-8 text-center">
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button onClick={retryFn}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
      
      {children}
    </div>
  );
};
