
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
  
  // Determine which page we're on
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? window.location.pathname.split('/').pop() : null;
  
  // Simplified loading state - just track if page is loading
  const [pageLoading, setPageLoading] = useState(true);
  
  // Load round tracking hook
  const roundTrackingWithErrorHandling = useRoundTracking();
  
  // Set loading to false after a very short delay
  useEffect(() => {
    // Mark the page as loaded almost immediately
    const timer = setTimeout(() => {
      setPageLoading(false);
      console.log("Page loading complete");
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    // Clear any resume-hole-number in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    navigate(-1);
  };
  
  // Get retry function from the hook
  const { retryLoading, isLoading } = roundTrackingWithErrorHandling;
  
  // Wrap everything with error boundary
  return (
    <ErrorBoundary>
      {isMainPage ? (
        <RoundTrackingMain 
          onBack={handleBack}
          pageLoading={false} // Always set to false to avoid loading issues
          roundTracking={roundTrackingWithErrorHandling}
        />
      ) : isDetailPage && roundTrackingWithErrorHandling.currentRoundId ? (
        <RoundTrackingDetail
          onBack={handleBack}
          currentRoundId={roundTrackingWithErrorHandling.currentRoundId}
          isLoading={false} // Always set to false to avoid loading issues
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
