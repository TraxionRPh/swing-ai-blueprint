
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
  const pathMatch = pathname.match(/\/rounds\/([a-zA-Z0-9-]+)(?:\/(\d+))?$/);
  const isNineHoleRound = pathname === '/rounds/new/9' || pathname.includes('/rounds/new/9/');
  const isEighteenHoleRound = pathname === '/rounds/new/18' || pathname.includes('/rounds/new/18/');
  const isDetailPage = !!pathMatch || isNineHoleRound || isEighteenHoleRound || pathname === '/rounds/new';
  const roundId = pathMatch ? pathMatch[1] : (isNineHoleRound || isEighteenHoleRound || pathname === '/rounds/new' ? "new" : null);
  const holeNumber = pathMatch && pathMatch[2] ? parseInt(pathMatch[2]) : null;

  const courseId = sessionStorage.getItem("current-course-id");
  const teeId = sessionStorage.getItem("current-tee-id");

  useEffect(() => {
    console.log("RoundTracking mounted with path:", pathname);
    console.log("isMainPage:", isMainPage, "roundId:", roundId, "holeNumber:", holeNumber);
    console.log("isNineHoleRound:", isNineHoleRound, "isEighteenHoleRound:", isEighteenHoleRound);

    // Store hole count in session storage based on URL
    if (isNineHoleRound) {
      sessionStorage.setItem('current-hole-count', '9');
      console.log("Set hole count to 9 in session storage");
    } else if (isEighteenHoleRound) {
      sessionStorage.setItem('current-hole-count', '18');
      console.log("Set hole count to 18 in session storage");
    } else if (!sessionStorage.getItem('current-hole-count')) {
      // For the /rounds/new path, set a reasonable default
      sessionStorage.setItem('current-hole-count', '18');
      console.log("Set default hole count to 18 in session storage");
    }

    // Log current hole count from session storage
    const currentHoleCount = sessionStorage.getItem('current-hole-count');
    console.log("Current hole count from session storage:", currentHoleCount);

    const timer = setTimeout(() => {
      setLoading(false);
      console.log("Initial loading state complete");
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
