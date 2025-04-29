
import { useNavigate } from "react-router-dom";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useEffect, useRef, useState } from "react";
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
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Determine which page we're on
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? window.location.pathname.split('/').pop() : null;
  
  // Load round tracking hook - single instance with lazy initialization
  const roundTracking = useRoundTracking();
  const { isLoading, retryLoading, currentRoundId } = roundTracking;
  
  // One-time initialization logic
  useEffect(() => {
    // Only run this once
    if (!initialRenderRef.current) return;
    initialRenderRef.current = false;
    
    console.log("RoundTracking component mounted, path:", window.location.pathname);
    
    // Clear any resume-hole-number in session storage when viewing the main rounds page
    if (isMainPage) {
      sessionStorage.removeItem('resume-hole-number');
    }
    
    // Mark as initialized after a small delay to prevent rapid renders
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isMainPage]);

  // Handle automatic navigation to detail page when current round changes
  useEffect(() => {
    // Skip if we've already navigated or not initialized
    if (hasNavigatedRef.current || !isInitialized) return;
    
    if (isMainPage && currentRoundId && !isLoading) {
      console.log("Auto-navigating to round detail:", currentRoundId);
      hasNavigatedRef.current = true;
      navigate(`/rounds/${currentRoundId}`);
    }
  }, [currentRoundId, isMainPage, navigate, isLoading, isInitialized]);

  const handleBack = () => {
    // Clear any resume-hole-number in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    navigate(-1);
  };
  
  // Determine what to render based on our current state
  const renderContent = () => {
    // Always show loading while not initialized or explicitly loading
    if (!isInitialized || isLoading) {
      return (
        <RoundTrackingLoading
          onBack={handleBack}
          roundId={roundId}
          retryLoading={retryLoading}
        />
      );
    }
    
    // Show main page for /rounds
    if (isMainPage) {
      return (
        <RoundTrackingMain 
          onBack={handleBack}
          pageLoading={false}
          roundTracking={roundTracking}
        />
      );
    }
    
    // Show detail page for /rounds/:id
    if (isDetailPage && currentRoundId) {
      return (
        <RoundTrackingDetail
          onBack={handleBack}
          currentRoundId={currentRoundId}
          isLoading={false}
          retryLoading={retryLoading}
          roundTracking={roundTracking}
        />
      );
    }
    
    // Fallback to loading
    return (
      <RoundTrackingLoading
        onBack={handleBack}
        roundId={roundId}
        retryLoading={retryLoading}
      />
    );
  };
  
  console.log("Round tracking render conditions:", {
    selectedCourse: !!roundTracking.selectedCourse,
    currentRoundId: !!currentRoundId,
    isLoading
  });
  
  // Wrap everything with error boundary
  return (
    <ErrorBoundary>
      {renderContent()}
    </ErrorBoundary>
  );
};

export default RoundTracking;
