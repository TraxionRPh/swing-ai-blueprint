
import { useNavigate } from "react-router-dom";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoundTrackingMain } from "@/components/round-tracking/RoundTrackingMain";
import { RoundTrackingDetail } from "@/components/round-tracking/RoundTrackingDetail";
import { RoundTrackingLoading } from "@/components/round-tracking/RoundTrackingLoading";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useResumeSession } from "@/hooks/round-tracking/score/use-resume-session";

const RoundTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { savedHoleNumber } = useResumeSession();
  
  // Only load the complex hook if we're not on the main page
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? window.location.pathname.split('/').pop() : null;
  
  // Simplified loading for the main page
  const [pageLoading, setPageLoading] = useState(false);
  
  // Use error boundary fallback for detailed component
  const roundTracking = useRoundTracking();
  
  // Initialize component on mount
  useEffect(() => {
    console.log("RoundTracking loaded, path:", window.location.pathname);
    
    // Short timeout to ensure UI renders smoothly
    if (pageLoading) {
      const loadingTimeout = setTimeout(() => {
        setPageLoading(false);
      }, 100);
      
      return () => clearTimeout(loadingTimeout);
    }
  }, [pageLoading]);

  const handleBack = () => {
    // Clear any resume-hole-number in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    navigate(-1);
  };

  return (
    <ErrorBoundary>
      {isMainPage ? (
        <RoundTrackingMain 
          onBack={handleBack}
          pageLoading={false}
          roundTracking={roundTracking}
        />
      ) : isDetailPage && roundTracking.currentRoundId ? (
        <RoundTrackingDetail
          onBack={handleBack}
          currentRoundId={roundTracking.currentRoundId}
          isLoading={false}
          retryLoading={roundTracking.retryLoading}
          roundTracking={roundTracking}
        />
      ) : (
        <RoundTrackingLoading
          onBack={handleBack}
          roundId={roundId}
          retryLoading={roundTracking.retryLoading}
        />
      )}
    </ErrorBoundary>
  );
};

export default RoundTracking;
