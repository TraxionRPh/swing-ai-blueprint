
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ReactNode, useState, useEffect, useRef } from "react";
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const networkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Show retry button after a short delay
  useEffect(() => {
    // Set timeouts to show UI elements progressively
    timeoutRef.current = setTimeout(() => setShowRetry(true), 2000);
    networkTimeoutRef.current = setTimeout(() => setShowNetworkAlert(true), 5000);
    
    // Cleanup timeouts to prevent memory leaks
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (networkTimeoutRef.current) clearTimeout(networkTimeoutRef.current);
    };
  }, []);

  const handleRefresh = () => {
    setShowNetworkAlert(false); // Hide alert when retrying
    
    if (retryFn) {
      // Use provided retry function if available
      retryFn();
      
      // Reset the UI state
      setShowRetry(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (networkTimeoutRef.current) clearTimeout(networkTimeoutRef.current);
      
      // Set new timeouts
      timeoutRef.current = setTimeout(() => setShowRetry(true), 2000);
      networkTimeoutRef.current = setTimeout(() => setShowNetworkAlert(true), 5000);
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
      
      <div className="w-full flex flex-col items-center">
        <Loading message={displayMessage} minHeight="200px" />
        
        {showRetry && (
          <Button 
            onClick={handleRefresh} 
            className="mt-4"
            variant="outline"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry loading round
          </Button>
        )}
        
        {showNetworkAlert && (
          <Alert className="mt-4 mx-auto max-w-md">
            <AlertDescription className="text-center">
              There might be a connection issue. Check your network connection and try again.
            </AlertDescription>
          </Alert>
        )}
        
        {children}
      </div>
    </div>
  );
};
