
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ReactNode, useState, useEffect } from "react";
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
  // Add a state to track if content has been loaded
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
  
  useEffect(() => {
    // Show retry button after a short delay if content isn't loaded
    if (!contentLoaded) {
      const retryTimer = setTimeout(() => {
        setShowRetry(true);
      }, 2000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [contentLoaded]);

  const handleRefresh = () => {
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
      
      {!contentLoaded && (
        <div className="w-full flex justify-center">
          <Loading message={displayMessage} size="md" minHeight={150} />
        </div>
      )}
      
      {showRetry && !contentLoaded && (
        <div className="mt-4 text-center">
          <Button onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry loading
          </Button>
        </div>
      )}
      
      {children && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
};
