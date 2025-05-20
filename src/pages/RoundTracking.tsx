
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoundTrackingMain } from "@/components/round-tracking/RoundTrackingMain";
import { RoundTrackingDetail } from "@/components/round-tracking/RoundTrackingDetail";
import { RoundTrackingLoading } from "@/components/round-tracking/RoundTrackingLoading";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useHoleCountDetection } from "@/hooks/round-tracking/useHoleCountDetection";

const RoundTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the improved hook for hole count detection
  const { detectHoleCountFromUrl, cleanupHoleCount } = useHoleCountDetection();

  const pathname = window.location.pathname;
  const isMainPage = pathname === "/rounds";
  
  // Enhanced path matching with more explicit patterns
  const pathMatch = pathname.match(/\/rounds\/([a-zA-Z0-9-]+)(?:\/(\d+))?$/);
  
  // More specific pattern matching for 9 and 18-hole rounds
  const isNineHolePattern = /\/rounds\/new\/9($|\/)|\/9\//;
  const isNineHoleRound = isNineHolePattern.test(pathname);
  
  const isEighteenHolePattern = /\/rounds\/new\/18($|\/)|\/18\//; 
  const isEighteenHoleRound = isEighteenHolePattern.test(pathname);
  
  const isDetailPage = !!pathMatch || isNineHoleRound || isEighteenHoleRound || pathname === '/rounds/new';
  const roundId = pathMatch ? pathMatch[1] : (isNineHoleRound || isEighteenHoleRound || pathname === '/rounds/new' ? "new" : null);
  const holeNumber = pathMatch && pathMatch[2] ? parseInt(pathMatch[2]) : null;

  // Force session storage to match URL path for hole count
  useEffect(() => {
    if (isNineHoleRound) {
      sessionStorage.setItem('current-hole-count', '9');
      console.log("Force-set hole count to 9 based on URL in RoundTracking");
    } else if (isEighteenHoleRound) {
      sessionStorage.setItem('current-hole-count', '18');
      console.log("Force-set hole count to 18 based on URL in RoundTracking");
    }
  }, [isNineHoleRound, isEighteenHoleRound]);

  const courseId = sessionStorage.getItem("current-course-id");
  const teeId = sessionStorage.getItem("current-tee-id");

  useEffect(() => {
    console.log("RoundTracking mounted with path:", pathname);
    console.log("URL analysis:", {
      isMainPage, 
      roundId, 
      holeNumber,
      isNineHoleRound,
      isEighteenHoleRound
    });

    // Detect hole count when component mounts or URL changes
    const detectedCount = detectHoleCountFromUrl();
    console.log(`Detected hole count: ${detectedCount}`);

    // Always log current value for debugging
    const currentHoleCount = sessionStorage.getItem('current-hole-count');
    console.log(`Current hole count in session storage: ${currentHoleCount}`);

    // Add validation for 9-hole rounds to ensure session storage is correct
    if (isNineHoleRound && currentHoleCount !== '9') {
      console.log("URL indicates 9-hole round but session storage doesn't match, correcting");
      sessionStorage.setItem('current-hole-count', '9');
    } else if (isEighteenHoleRound && currentHoleCount !== '18') {
      console.log("URL indicates 18-hole round but session storage doesn't match, correcting");
      sessionStorage.setItem('current-hole-count', '18');
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, isNineHoleRound, isEighteenHoleRound, detectHoleCountFromUrl]);

  const handleBack = () => {
    console.log("Back navigation triggered");

    if (holeNumber && roundId) {
      console.log("Navigating from hole view to round detail");
      navigate(`/rounds/${roundId}`);
      return;
    }

    // Clean up all session data when returning to main rounds page
    cleanupHoleCount();
    sessionStorage.removeItem("resume-hole-number");
    localStorage.removeItem("resume-hole-number");
    sessionStorage.removeItem("force-resume");
    sessionStorage.removeItem("force-new-round");
    
    navigate("/rounds");
  };

  const retryLoading = () => {
    console.log("Retrying loading...");
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  return (
    <ErrorBoundary>
      {loading ? (
        <RoundTrackingLoading
          onBack={handleBack}
          roundId={roundId}
          retryLoading={retryLoading}
          error={error}
        />
      ) : isMainPage ? (
        <RoundTrackingMain
          onBack={handleBack}
          setMainLoading={setLoading}
          setMainError={setError}
        />
      ) : (
        <RoundTrackingDetail
          onBack={handleBack}
          currentRoundId={roundId}
          initialHoleNumber={holeNumber}
          retryLoading={retryLoading}
          setDetailLoading={setLoading}
          setDetailError={setError}
          courseId={courseId}
          teeId={teeId}
        />
      )}
    </ErrorBoundary>
  );
};

export default RoundTracking;
