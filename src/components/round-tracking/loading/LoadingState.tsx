
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
  const [contentLoaded, setContentLoaded] = useState(false);
  
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
    
    // Only set timeouts if we haven't loaded content yet
    if (!contentLoaded) {
      const retryTimer = setTimeout(() => {
        if (isMountedRef.current && !contentLoaded) {
          setShowRetry(true);
        }
      }, 3500);
      
      const networkAlertTimer = setTimeout(() => {
        if (isMountedRef.current && !contentLoaded) {
          setShowNetworkAlert(true);
        }
      }, 6000);
      
      const forceExitTimer = setTimeout(() => {
        if (isMountedRef.current) {
          setForceExit(true);
        }
      }, 8000);
      
      return () => {
        isMountedRef.current = false;
        clearTimeout(retryTimer);
        clearTimeout(networkAlertTimer);
        clearTimeout(forceExitTimer);
      };
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [contentLoaded]);

  const handleRefresh = () => {
    setShowNetworkAlert(false);
    
    if (retryFn) {
      retryFn();
      setShowRetry(false);
      // Reset timeouts only if we haven't loaded content
      if (!contentLoaded) {
        const retryTimer = setTimeout(() => {
          if (isMountedRef.current && !contentLoaded) {
            setShowRetry(true);
          }
        }, 3500);
        
        const networkAlertTimer = setTimeout(() => {
          if (isMountedRef.current && !contentLoaded) {
            setShowNetworkAlert(true);
          }
        }, 6000);
        
        return () => {
          clearTimeout(retryTimer);
          clearTimeout(networkAlertTimer);
        };
      }
    } else {
      window.location.reload();
    }
  };

  // If we have a roundId, append it to the message
  const displayMessage = roundId 
    ? `${message} (Round ID: ${roundId.substring(0, 8)}...)`
    : message;
  
  // If content is loaded, don't show loading indicators
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
          <Loading message={displayMessage} />
        </div>
      )}
      
      {showNetworkAlert && showLoadingIndicators && (
        <Alert className="mt-4 mx-auto max-w-md">
          <AlertDescription className="text-center">
            There might be a connection issue. Check your network connection and try again.
          </AlertDescription>
        </Alert>
      )}
      
      {showRetry && showLoadingIndicators && (
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
      
      {(children || forceExit) && (
        <div className={contentLoaded ? "" : "opacity-0 h-0 overflow-hidden"}>
          {children}
        </div>
      )}
    </div>
  );
};
