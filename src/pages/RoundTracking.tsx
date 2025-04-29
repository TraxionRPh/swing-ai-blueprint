
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
  const didInitializeRef = useRef(true); // Start as initialized
  const { savedHoleNumber } = useResumeSession();
  
  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  // Only load the complex hook if we're not on the main page
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? window.location.pathname.split('/').pop() : null;
  
  // Simplified loading for the main page
  const [pageLoading, setPageLoading] = useState(false); // Start as not loading
  const [isInitialized, setIsInitialized] = useState(true); // Start as initialized
  
  // Use error boundary fallback for detailed component
  const roundTrackingWithErrorHandling = useRoundTracking();
  
  // Initialize component on mount
  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;
    
    // Short timeout to ensure UI renders smoothly
    const loadingTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        setPageLoading(false);
        console.log("Initialized RoundTracking component");
      }
    }, 100);
    
    // Log initial load info
    console.log("RoundTracking loaded, path:", window.location.pathname);
    
    return () => {
      // Mark component as unmounted to prevent state updates
      isMountedRef.current = false;
      // Clean up timeout
      clearTimeout(loadingTimeout);
    };
  }, []);

  const handleBack = () => {
    // Clear any resume-hole-number in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    navigate(-1);
  };
  
  // Get retryLoading from the hook
  const { retryLoading, isLoading } = roundTrackingWithErrorHandling;
  
  // Always treat as loaded
  const effectiveIsLoading = false;

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
