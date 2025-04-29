
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ReactNode, useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";

interface LoadingStateProps {
  onBack: () => void;
  children?: ReactNode;
  hideHeader?: boolean;
  message?: string;
  retryFn?: () => void;
  roundId?: string;
}

export const LoadingState = ({ 
  onBack, 
  children, 
  hideHeader = false, 
  message = "Loading round data...",
  retryFn,
  roundId
}: LoadingStateProps) => {
  const [showRetry, setShowRetry] = useState(false);
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);
  // Add a state to force exit loading after a certain time
  const [forceExit, setForceExit] = useState(false);
  
  // Reduce timeouts for faster user experience, but avoid showing alerts too quickly
  useEffect(() => {
    const timer = setTimeout(() => setShowRetry(true), 3500); // Increased from 2s to 3.5s
    
    // Only show network alert after a longer delay to avoid false positives
    const networkTimer = setTimeout(() => setShowNetworkAlert(true), 6000); // Increased from 3.5s to 6s
    
    // Force exit loading state after 8 seconds (increased from 5s)
    const forceExitTimer = setTimeout(() => setForceExit(true), 8000);
    
    return () => {
      clearTimeout(timer); 
      clearTimeout(networkTimer);
      clearTimeout(forceExitTimer);
    };
  }, []);

  // If we force exit the loading state, redirect to the main rounds page
  useEffect(() => {
    if (forceExit) {
      // Notify the user but continue showing content when available
      console.log("Force exited loading state - if content is ready it will be displayed");
    }
  }, [forceExit, onBack]);

  const handleRefresh = () => {
    setShowNetworkAlert(false); // Hide alert when retrying
    
    if (retryFn) {
      // Use provided retry function if available
      retryFn();
      // Reset the retry state
      setShowRetry(false);
      // Set timeout again with longer delays to prevent false positives
      const timer = setTimeout(() => setShowRetry(true), 3500);
      const networkTimer = setTimeout(() => setShowNetworkAlert(true), 6000);
      return () => {
        clearTimeout(timer);
        clearTimeout(networkTimer);
      };
    } else {
      // Fallback to page reload
      window.location.reload();
    }
  };

  // If we have a roundId, append it to the message
  const displayMessage = roundId 
    ? `${message} (Round ID: ${roundId.substring(0, 8)}...)`
    : message;
  
  return (
    <div className="space-y-6 w-full">
      {!hideHeader && (
        <RoundTrackingHeader
          onBack={onBack}
          hideBackButton={false}
          title="Round Tracking"
          subtitle="Track your round hole by hole"
        />
      )}
      
      <div className="w-full flex justify-center">
        <Loading message={displayMessage} />
      </div>
      
      {showNetworkAlert && (
        <Alert className="mt-4 mx-auto max-w-md">
          <AlertDescription className="text-center">
            There might be a connection issue. Check your network connection and try again.
          </AlertDescription>
        </Alert>
      )}
      
      {showRetry && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Taking longer than expected. 
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry loading round
          </Button>
        </div>
      )}
      
      {children}
    </div>
  );
};
