
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCcw } from "lucide-react";
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
  // Add a state to force exit loading after a certain time
  const [forceExit, setForceExit] = useState(false);
  // Track if component is still mounted
  const isMountedRef = useRef(true);
  // Track if content has been loaded
  const [contentLoaded, setContentLoaded] = useState(!!children);
  
  // Check if we have children content which indicates successful loading
  useEffect(() => {
    if (children) {
      setContentLoaded(true);
      // If content is loaded, we don't need to show alerts
      setShowNetworkAlert(false);
      setShowRetry(false);
    }
  }, [children]);
  
  // Set up cleanup and timeout management
  useEffect(() => {
    isMountedRef.current = true;
    
    // Set a shorter force exit timer to prevent prolonged loading states
    const forceExitTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setForceExit(true);
      }
    }, 3000); // Reduced from 8s to 3s
    
    // Only set timeouts if we haven't loaded content yet
    if (!contentLoaded) {
      const retryTimer = setTimeout(() => {
        if (isMountedRef.current && !contentLoaded) {
          setShowRetry(true);
        }
      }, 2000); // Reduced from 3.5s
      
      return () => {
        isMountedRef.current = false;
        clearTimeout(retryTimer);
        clearTimeout(forceExitTimer);
      };
    }
    
    return () => {
      isMountedRef.current = false;
      clearTimeout(forceExitTimer);
    };
  }, [contentLoaded]);

  const handleRefresh = () => {
    setShowNetworkAlert(false);
    
    if (retryFn) {
      retryFn();
      setShowRetry(false);
    } else {
      window.location.reload();
    }
  };

  // If we have a roundId, append it to the message
  const displayMessage = roundId 
    ? `${message} (Round ID: ${roundId.substring(0, 8)}...)`
    : message;
  
  // If content is loaded or we've forced exit, don't show loading indicators
  const showLoadingIndicators = !contentLoaded && !forceExit;
  
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
      
      {showLoadingIndicators && (
        <div className="w-full flex justify-center">
          <Loading message={displayMessage} size="md" minHeight={150} />
        </div>
      )}
      
      {showRetry && showLoadingIndicators && (
        <div className="mt-4 text-center">
          <Button onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry loading
          </Button>
        </div>
      )}
      
      {(children || forceExit) && (
        <div className={contentLoaded ? "" : "opacity-0 h-0 overflow-hidden"}>
          {children || <div className="p-4 text-center">Loading complete</div>}
        </div>
      )}
    </div>
  );
};
