
import { useNavigate } from "react-router-dom";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoundTrackingMain } from "@/components/round-tracking/RoundTrackingMain";
import { RoundTrackingDetail } from "@/components/round-tracking/RoundTrackingDetail";
import { RoundTrackingLoading } from "@/components/round-tracking/RoundTrackingLoading";
import ErrorBoundary from "@/components/ErrorBoundary";

const RoundTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Only load the complex hook if we're not on the main page
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? window.location.pathname.split('/').pop() : null;
  
  // Simplified loading for the main page
  const [pageLoading, setPageLoading] = useState(!isMainPage);
  const [loadRetries, setLoadRetries] = useState(0);
  const maxRetries = 2;
  
  useEffect(() => {
    // If we're on the main rounds page, set loading to false after a short delay
    if (isMainPage) {
      const timer = setTimeout(() => setPageLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isMainPage]);
  
  // Use error boundary fallback for detailed component
  const roundTrackingWithErrorHandling = useRoundTracking();
  
  // Force timeout of loading state after 12 seconds to prevent infinite loading
  useEffect(() => {
    if (!isDetailPage || !roundTrackingWithErrorHandling.isLoading) return;
    
    const forceTimeout = setTimeout(() => {
      if (roundTrackingWithErrorHandling.isLoading && loadRetries < maxRetries) {
        console.log("Forcing retry of round loading after timeout");
        setLoadRetries(prev => prev + 1);
        // Force reload the page if we're still loading after multiple retries
        if (loadRetries >= maxRetries - 1) {
          toast({
            title: "Loading issue detected",
            description: "Showing available data. Some information may be limited.",
            variant: "destructive",
          });
          
          // Instead of reloading, just force isLoading to false after max retries
          roundTrackingWithErrorHandling.setIsLoading?.(false);
        }
      }
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(forceTimeout);
  }, [roundTrackingWithErrorHandling.isLoading, loadRetries, isDetailPage, toast]);

  const handleBack = () => {
    // Clear any resume-hole-number in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    navigate(-1);
  };

  const retryLoading = () => {
    // This will trigger the useEffect above to retry loading
    setLoadRetries(prev => prev + 1);
  };
  
  // Wrap the components with error boundary
  return (
    <ErrorBoundary>
      {isMainPage ? (
        <RoundTrackingMain 
          onBack={handleBack}
          pageLoading={pageLoading}
          roundTracking={roundTrackingWithErrorHandling}
        />
      ) : isDetailPage && roundTrackingWithErrorHandling.currentRoundId ? (
        <RoundTrackingDetail
          onBack={handleBack}
          currentRoundId={roundTrackingWithErrorHandling.currentRoundId}
          isLoading={roundTrackingWithErrorHandling.isLoading}
          retryLoading={retryLoading}
          roundTracking={roundTrackingWithErrorHandling}
        />
      ) : (
        <RoundTrackingLoading
          onBack={handleBack}
          roundId={roundId}
          retryLoading={retryLoading}
        />
      )}
    </ErrorBoundary>
  );
};

export default RoundTracking;
