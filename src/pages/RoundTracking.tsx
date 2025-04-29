
import { useNavigate } from "react-router-dom";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoundTrackingMain } from "@/components/round-tracking/RoundTrackingMain";
import { RoundTrackingDetail } from "@/components/round-tracking/RoundTrackingDetail";
import { RoundTrackingLoading } from "@/components/round-tracking/RoundTrackingLoading";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useRouteInitialization } from "@/hooks/round-tracking/score/use-route-initialization";

const RoundTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const initialRenderRef = useRef(true);
  const hasNavigatedRef = useRef(false);
  const mountedRef = useRef(true);
  
  // Determine which page we're on
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? window.location.pathname.split('/').pop() : null;
  
  // Use route initialization to prevent duplicate loading
  const { isInitialized } = useRouteInitialization(roundId);
  
  // Load round tracking hook - single instance with lazy initialization
  const roundTracking = useRoundTracking();
  const { isLoading, retryLoading, currentRoundId } = roundTracking;
  
  // One-time initialization logic
  useEffect(() => {
    // Record that we're mounted
    mountedRef.current = true;
    console.log("RoundTracking component mounted, path:", window.location.pathname);
    
    // Prevent multiple initialization
    if (!initialRenderRef.current) {
      console.log("Not initial render, skipping initialization");
      return;
    }
    initialRenderRef.current = false;
    
    // Clear any resume-hole-number when viewing the main rounds page
    if (isMainPage) {
      console.log("Main rounds page, clearing resume data");
      sessionStorage.removeItem('resume-hole-number');
    }
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
    };
  }, []); // Empty dependency array - run once on mount

  // Handle automatic navigation to detail page when current round changes
  useEffect(() => {
    // Skip if we've already navigated, not initialized, or component is unmounted
    if (hasNavigatedRef.current || !isInitialized || !mountedRef.current) {
      return;
    }
    
    // Only navigate if we're on main page, have a round ID, and not in loading state
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
    // Show loading while initializing or explicitly loading
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
    if (isDetailPage && roundId) {
      return (
        <RoundTrackingDetail
          onBack={handleBack}
          currentRoundId={roundId}
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
    isInitialized,
    isLoading,
    isMainPage,
    isDetailPage,
    roundId
  });
  
  // Wrap everything with error boundary
  return (
    <ErrorBoundary>
      {renderContent()}
    </ErrorBoundary>
  );
};

export default RoundTracking;
