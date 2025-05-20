
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

  const pathname = window.location.pathname;
  const isMainPage = pathname === "/rounds";
  
  // Enhanced path matching
  const pathMatch = pathname.match(/\/rounds\/([a-zA-Z0-9-]+)(?:\/(\d+))?$/);
  
  // More specific pattern matching for 9 and 18-hole rounds
  const isNineHolePattern = /\/rounds\/new\/9($|\/)/;
  const isNineHoleRound = isNineHolePattern.test(pathname);
  
  const isEighteenHolePattern = /\/rounds\/new\/18($|\/)/; 
  const isEighteenHoleRound = isEighteenHolePattern.test(pathname);
  
  const isDetailPage = !!pathMatch || isNineHoleRound || isEighteenHoleRound || pathname === '/rounds/new';
  const roundId = pathMatch ? pathMatch[1] : (isNineHoleRound || isEighteenHoleRound || pathname === '/rounds/new' ? "new" : null);
  const holeNumber = pathMatch && pathMatch[2] ? parseInt(pathMatch[2]) : null;

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

    // Explicitly handle the hole count based on URL with clear priorities
    if (isNineHoleRound) {
      // Priority 1: Path explicitly indicates 9 holes
      console.log("URL path explicitly indicates 9-hole round");
      sessionStorage.setItem('current-hole-count', '9');
    } else if (isEighteenHoleRound) {
      // Priority 1: Path explicitly indicates 18 holes
      console.log("URL path explicitly indicates 18-hole round");
      sessionStorage.setItem('current-hole-count', '18');
    } else if (pathname === '/rounds/new') {
      // Priority 2: For generic new round path, check if we already have a setting
      const existingCount = sessionStorage.getItem('current-hole-count');
      if (existingCount) {
        console.log(`Using existing hole count ${existingCount} from session storage`);
      } else {
        // Priority 3: Default to 18 if nothing else specified
        console.log("No hole count specified, defaulting to 18");
        sessionStorage.setItem('current-hole-count', '18');
      }
    }

    // Always log current value for debugging
    const currentHoleCount = sessionStorage.getItem('current-hole-count');
    console.log(`Current hole count in session storage: ${currentHoleCount}`);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, isNineHoleRound, isEighteenHoleRound]);

  const handleBack = () => {
    console.log("Back navigation triggered");

    if (holeNumber && roundId) {
      console.log("Navigating from hole view to round detail");
      navigate(`/rounds/${roundId}`);
      return;
    }

    sessionStorage.removeItem("resume-hole-number");
    localStorage.removeItem("resume-hole-number");
    sessionStorage.removeItem("force-resume");

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
