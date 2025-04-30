
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
  
  // Extract roundId from URL path
  const pathname = window.location.pathname;
  const isMainPage = pathname === '/rounds';
  const isDetailPage = pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? pathname.split('/').pop() : null;
  
  // Initialize component and exit loading state
  useEffect(() => {
    console.log("RoundTracking mounted with path:", pathname);
    console.log("isMainPage:", isMainPage, "roundId:", roundId);
    
    // Exit loading state after initial setup
    const timer = setTimeout(() => {
      setLoading(false);
      console.log("Initial loading state complete");
    }, 500); // Short timeout for better UX
    
    return () => clearTimeout(timer);
  }, [pathname]);
  
  // Handle back navigation
  const handleBack = () => {
    console.log("Back navigation triggered");
    // Clear any resume data
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
    
    window.location.reload();
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
