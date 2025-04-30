
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
    setLoading(false);
    
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
          pageLoading={false}
          setMainLoading={setLoading}
          setMainError={setError}
        />
      ) : (
        // Show round detail page if we have a round ID
        <RoundTrackingDetail
          onBack={handleBack}
          currentRoundId={roundId}
          isLoading={false}
          loadingStage="ready"
          retryLoading={() => setLoading(false)}
          setDetailLoading={setLoading}
          setDetailError={setError}
        />
      )}
    </ErrorBoundary>
  );
};

export default RoundTracking;
