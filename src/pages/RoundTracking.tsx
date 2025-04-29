
import { useNavigate } from "react-router-dom";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoundTrackingMain } from "@/components/round-tracking/RoundTrackingMain";
import { RoundTrackingDetail } from "@/components/round-tracking/RoundTrackingDetail";
import { RoundTrackingLoading } from "@/components/round-tracking/RoundTrackingLoading";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useResumeSession } from "@/hooks/round-tracking/score/use-resume-session";

const RoundTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const didInitializeRef = useRef(false);
  const { savedHoleNumber } = useResumeSession();
  
  // Track whether this is the first render since page load
  const isFirstLoadRef = useRef(true);
  
  // Don't show error toasts on first load
  const [hasShownError, setHasShownError] = useState(false);
  
  // Only load the complex hook if we're not on the main page
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? window.location.pathname.split('/').pop() : null;
  
  // Simplified loading for the main page
  const [pageLoading, setPageLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use error boundary fallback for detailed component
  const roundTrackingWithErrorHandling = useRoundTracking();
  
  // Initialize component on mount
  useEffect(() => {
    // Mark as initialized immediately to avoid loading issues
    didInitializeRef.current = true;
    setIsInitialized(true);
    
    // Short timeout to load data
    setTimeout(() => {
      setPageLoading(false);
      console.log("Initialized RoundTracking component");
    }, 300);
    
    // Only run once on initial page load
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      console.log("Initial page load of RoundTracking, path:", window.location.pathname);
      console.log("Checking for resume data...", { savedHoleNumber });
    }
  }, [savedHoleNumber]);

  const handleBack = () => {
    // Clear any resume-hole-number in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    navigate(-1);
  };
  
  // Directly use retryLoading from the hook
  const { retryLoading, isLoading } = roundTrackingWithErrorHandling;
  
  // Determine if we should override the loading state - use a shorter timeout
  const effectiveIsLoading = isLoading && !didInitializeRef.current;

  // Clear any error toasts that might have been shown on page exit
  useEffect(() => {
    return () => {
      // Cleanup function that runs when component unmounts
      console.log("Round tracking component unmounting, cleaning up...");
    };
  }, []);
  
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
