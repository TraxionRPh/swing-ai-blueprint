
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
  
  // Extract roundId from URL path
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? window.location.pathname.split('/').pop() : null;
  
  // Track whether we're in the initial loading state for the page
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadRetries, setLoadRetries] = useState(0);
  
  // Centralized loading state management
  const {
    isLoading: roundStateLoading,
    loadingStage,
    resetLoading,
    retryCount,
    error
  } = useRoundLoadingState(roundId);
  
  // Load round tracking hooks with error handling
  const roundTracking = useRoundTracking();
  const { currentRoundId, isLoading: roundTrackingLoading } = roundTracking;
  
  // Combined loading state that accounts for all loading sources
  const isLoading = roundStateLoading || roundTrackingLoading || initialLoading;
  
  useEffect(() => {
    // For the main page, we can exit loading after a short delay
    if (isMainPage) {
      const timer = setTimeout(() => {
        console.log("Main page loading complete");
        setInitialLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    
    // For detail pages, set loading to false once we have the round data
    if (isDetailPage && currentRoundId === roundId && !roundStateLoading && !roundTrackingLoading) {
      console.log("Detail page loading complete, data is ready");
      setInitialLoading(false);
    }
  }, [isMainPage, isDetailPage, roundId, currentRoundId, roundStateLoading, roundTrackingLoading]);

  // Initialize the page - update the round ID in the tracking hook when the URL changes
  useEffect(() => {
    if (isDetailPage && roundId) {
      console.log("Setting round ID from URL:", roundId);
      roundTracking.setCurrentRoundId(roundId);
    }
  }, [isDetailPage, roundId, roundTracking.setCurrentRoundId]);

  // Handle back navigation
  const handleBack = () => {
    // Clear any resume-hole-number in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    navigate(-1);
  };

  // Handle retry loading
  const retryLoading = () => {
    // Reset loading state and increment retry count
    setLoadRetries(prev => prev + 1);
    setInitialLoading(true);
    resetLoading();
    
    // If we have a roundId, try to reload the data
    if (roundId) {
      roundTracking.setCurrentRoundId(null);
      // Small delay before setting the ID again to force a clean reload
      setTimeout(() => {
        roundTracking.setCurrentRoundId(roundId);
      }, 100);
    }
  };
  
  // Debug loading state
  console.log("Round tracking render conditions:", {
    isMainPage,
    isDetailPage,
    roundId,
    currentRoundId,
    isLoading,
    initialLoading,
    roundStateLoading,
    roundTrackingLoading,
    loadingStage
  });
  
  return (
    <ErrorBoundary>
      {isLoading ? (
        // Always show loading state when any loading flag is true
        <RoundTrackingLoading 
          onBack={handleBack}
          roundId={roundId}
          retryLoading={retryLoading}
        />
      ) : isMainPage ? (
        // Show main page when not loading and on the main route
        <RoundTrackingMain 
          onBack={handleBack}
          pageLoading={false}
          roundTracking={roundTracking}
        />
      ) : isDetailPage && currentRoundId ? (
        // Show detail page when not loading, on detail route, and have a round ID
        <RoundTrackingDetail
          onBack={handleBack}
          currentRoundId={currentRoundId}
          isLoading={false}
          loadingStage={loadingStage}
          retryLoading={retryLoading}
          roundTracking={roundTracking}
        />
      ) : (
        // Fallback to loading screen if none of the above conditions are met
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
