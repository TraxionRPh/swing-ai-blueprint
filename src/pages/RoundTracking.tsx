
import { useNavigate } from "react-router-dom";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoundTrackingMain } from "@/components/round-tracking/RoundTrackingMain";
import { RoundTrackingDetail } from "@/components/round-tracking/RoundTrackingDetail";
import { RoundTrackingLoading } from "@/components/round-tracking/RoundTrackingLoading";
import ErrorBoundary from "@/components/ErrorBoundary";

const RoundTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Only load the complex hook if we're not on the main page
  const isMainPage = useMemo(() => window.location.pathname === '/rounds', []);
  const isDetailPage = useMemo(() => !!window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/), []);
  const roundId = useMemo(() => isDetailPage ? window.location.pathname.split('/').pop() : null, [isDetailPage]);
  
  // Simplified loading for the main page
  const [pageLoading, setPageLoading] = useState(!isMainPage);
  const [loadRetries, setLoadRetries] = useState(0);
  const maxRetries = 2;
  
  // Use error boundary fallback for detailed component
  const roundTrackingWithErrorHandling = useRoundTracking();
  
  // Add state to handle forced completion of loading
  const [forceLoadingComplete, setForceLoadingComplete] = useState(false);
  
  useEffect(() => {
    // If we're on the main rounds page, set loading to false after a short delay
    if (isMainPage) {
      const timer = setTimeout(() => setPageLoading(false), 300); // Reduced from 500ms to 300ms
      return () => clearTimeout(timer);
    }
  }, [isMainPage]);
  
  // Force timeout of loading state after 8 seconds (reduced from 12s to 8s)
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
          
          setForceLoadingComplete(true);
        }
      }
    }, 8000); // Reduced from 10s to 8s
    
    return () => clearTimeout(forceTimeout);
  }, [roundTrackingWithErrorHandling.isLoading, loadRetries, isDetailPage, toast]);

  const handleBack = () => {
    // Clear any resume-hole-number in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    navigate(-1);
  };

  const retryLoading = () => {
    setLoadRetries(prev => prev + 1);
  };
  
  // Determine if we should override the loading state
  const effectiveIsLoading = forceLoadingComplete ? false : roundTrackingWithErrorHandling.isLoading;
  
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
          isLoading={effectiveIsLoading}
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
