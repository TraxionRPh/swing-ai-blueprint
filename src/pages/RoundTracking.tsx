
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
  const [error, setError] = useState<string | null>(null);
  
  // Extract roundId from URL path - simple approach
  const pathname = window.location.pathname;
  const isMainPage = pathname === '/rounds';
  const isDetailPage = pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? pathname.split('/').pop() : null;
  
  // Add a simple timeout to exit loading state after a reasonable time
  useEffect(() => {
    console.log("RoundTracking mounted, initializing with loading:", loading);
    console.log("Current path:", pathname, "isMainPage:", isMainPage, "roundId:", roundId);
    
    const timer = setTimeout(() => {
      setLoading(false);
      console.log("Automatic loading timeout elapsed, forcing loading to complete");
    }, 2000); // Short timeout for better UX
    
    return () => clearTimeout(timer);
  }, [pathname]);
  
  // Handle back navigation
  const handleBack = () => {
    // Clear any resume data in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
    navigate(-1);
  };
  
  // Retry loading
  const retryLoading = () => {
    console.log("Retrying loading...");
    setError(null);
    setLoading(true);
    
    // Short timeout to ensure state updates before reloading
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Simple conditional rendering based on page type
  return (
    <ErrorBoundary>
      {loading ? (
        // Show simple loading screen
        <RoundTrackingLoading 
          onBack={handleBack}
          roundId={roundId}
          retryLoading={retryLoading}
          error={error}
        />
      ) : isMainPage ? (
        // Show main rounds listing page
        <RoundTrackingMain 
          onBack={handleBack}
          setMainLoading={setLoading}
          setMainError={setError}
        />
      ) : (
        // Show round detail page if we have a round ID
        <RoundTrackingDetail
          onBack={handleBack}
          currentRoundId={roundId}
          retryLoading={retryLoading}
          setDetailLoading={setLoading}
          setDetailError={setError}
        />
      )}
    </ErrorBoundary>
  );
};

export default RoundTracking;
