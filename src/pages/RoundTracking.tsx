
import { useNavigate } from "react-router-dom";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoundTrackingMain } from "@/components/round-tracking/RoundTrackingMain";
import { RoundTrackingDetail } from "@/components/round-tracking/RoundTrackingDetail";
import { RoundTrackingLoading } from "@/components/round-tracking/RoundTrackingLoading";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useRoundLoadingState } from "@/hooks/round-tracking/useRoundLoadingState";

const RoundTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Determine page type from URL path
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? window.location.pathname.split('/').pop() : null;
  
  // Simplified loading for the main page
  const [pageLoading, setPageLoading] = useState(!isMainPage);
  const [loadRetries, setLoadRetries] = useState(0);
  
  // Centralized loading state management
  const {
    isLoading,
    loadingStage,
    resetLoading,
    retryCount,
    error
  } = useRoundLoadingState(roundId);
  
  // Load round tracking hooks with error handling
  const roundTrackingWithErrorHandling = useRoundTracking();
  
  // Initialize the page
  useEffect(() => {
    // If we're on the main rounds page, set loading to false after a short delay
    if (isMainPage) {
      const timer = setTimeout(() => setPageLoading(false), 500);
      return () => clearTimeout(timer);
    }
    
    // Update the round ID in the tracking hook when the URL changes
    if (isDetailPage && roundId) {
      console.log("Setting round ID from URL:", roundId);
      roundTrackingWithErrorHandling.setCurrentRoundId(roundId);
    }
  }, [isMainPage, isDetailPage, roundId, roundTrackingWithErrorHandling.setCurrentRoundId]);

  const handleBack = () => {
    // Clear any resume-hole-number in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    navigate(-1);
  };

  const retryLoading = () => {
    // Reset loading state and increment retry count
    setLoadRetries(prev => prev + 1);
    resetLoading();
    
    // If we have a roundId, try to reload the data
    if (roundId) {
      roundTrackingWithErrorHandling.setCurrentRoundId(null);
      // Small delay before setting the ID again to force a clean reload
      setTimeout(() => {
        roundTrackingWithErrorHandling.setCurrentRoundId(roundId);
      }, 100);
    }
  };
  
  // Determine if we are in a loading state
  const effectiveIsLoading = isLoading || roundTrackingWithErrorHandling.isLoading;
  
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
          loadingStage={loadingStage}
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
