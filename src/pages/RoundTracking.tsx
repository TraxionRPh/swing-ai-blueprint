
import { useNavigate } from "react-router-dom";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoundTrackingMain } from "@/components/round-tracking/RoundTrackingMain";
import { RoundTrackingDetail } from "@/components/round-tracking/RoundTrackingDetail";
import { RoundTrackingLoading } from "@/components/round-tracking/RoundTrackingLoading";
import ErrorBoundary from "@/components/ErrorBoundary";

const RoundTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const initialRenderRef = useRef(true);
  const hasNavigatedRef = useRef(false);
  
  // Determine which page we're on
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? window.location.pathname.split('/').pop() : null;
  
  // Load round tracking hook - single instance
  const roundTracking = useRoundTracking();
  const { isLoading, retryLoading, currentRoundId } = roundTracking;
  
  useEffect(() => {
    // Only run this once
    if (!initialRenderRef.current) return;
    initialRenderRef.current = false;
    
    console.log("RoundTracking component mounted, path:", window.location.pathname);
    
    // Clear any resume-hole-number in session storage when viewing the main rounds page
    if (isMainPage) {
      sessionStorage.removeItem('resume-hole-number');
    }
  }, [isMainPage]);

  // Handle automatic navigation to detail page when current round changes
  useEffect(() => {
    if (hasNavigatedRef.current) return;
    
    if (isMainPage && currentRoundId && !isLoading) {
      console.log("Auto-navigating to round detail:", currentRoundId);
      hasNavigatedRef.current = true;
      navigate(`/rounds/${currentRoundId}`);
    }
  }, [currentRoundId, isMainPage, navigate, isLoading]);

  const handleBack = () => {
    // Clear any resume-hole-number in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    navigate(-1);
  };
  
  // Wrap everything with error boundary
  return (
    <ErrorBoundary>
      {isLoading ? (
        <RoundTrackingLoading
          onBack={handleBack}
          roundId={roundId}
          retryLoading={retryLoading}
        />
      ) : isMainPage ? (
        <RoundTrackingMain 
          onBack={handleBack}
          pageLoading={false}
          roundTracking={roundTracking}
        />
      ) : isDetailPage && currentRoundId ? (
        <RoundTrackingDetail
          onBack={handleBack}
          currentRoundId={currentRoundId}
          isLoading={false}
          retryLoading={retryLoading}
          roundTracking={roundTracking}
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
