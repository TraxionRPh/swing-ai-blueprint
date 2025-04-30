
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoundTrackingMain } from "@/components/round-tracking/RoundTrackingMain";
import { RoundTrackingDetail } from "@/components/round-tracking/RoundTrackingDetail";
import { RoundTrackingLoading } from "@/components/round-tracking/RoundTrackingLoading";
import ErrorBoundary from "@/components/ErrorBoundary";

const RoundTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Extract roundId from URL path - simple approach
  const pathname = window.location.pathname;
  const isMainPage = pathname === '/rounds';
  const isDetailPage = pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? pathname.split('/').pop() : null;
  
  // Simple loading timeout for the main page
  useEffect(() => {
    console.log("RoundTracking mounted, isMainPage:", isMainPage);
    
    // Simple timeout to show loading and then display content
    const timer = setTimeout(() => {
      console.log("Setting loading to false after timeout");
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isMainPage]);
  
  // Handle back navigation
  const handleBack = () => {
    // Clear any resume data in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
    navigate(-1);
  };

  console.log("RoundTracking render - loading:", loading, "isMainPage:", isMainPage, "roundId:", roundId);

  // Super simple conditional rendering based on page type
  return (
    <ErrorBoundary>
      {loading ? (
        // Show simple loading screen
        <RoundTrackingLoading 
          onBack={handleBack}
          roundId={roundId}
          retryLoading={() => setLoading(false)}
        />
      ) : isMainPage ? (
        // Show main rounds listing page
        <RoundTrackingMain 
          onBack={handleBack}
          pageLoading={false}
        />
      ) : (
        // Show round detail page if we have a round ID
        <RoundTrackingDetail
          onBack={handleBack}
          currentRoundId={roundId}
          isLoading={false}
          loadingStage="ready"
          retryLoading={() => setLoading(false)}
        />
      )}
    </ErrorBoundary>
  );
};

export default RoundTracking;
