import { useNavigate } from "react-router-dom";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoundTrackingMain } from "@/components/round-tracking/RoundTrackingMain";
import { RoundTrackingDetail } from "@/components/round-tracking/RoundTrackingDetail";
import { RoundTrackingLoading } from "@/components/round-tracking/RoundTrackingLoading";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useRoundLoadingState } from "@/hooks/round-tracking/useRoundLoadingState";

const RoundTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? window.location.pathname.split('/').pop() : null;
  
  const [pageLoading, setPageLoading] = useState(true);
  
  const {
    isLoading: roundStateLoading,
    loadingStage,
    resetLoading,
    error
  } = useRoundLoadingState(roundId);
  
  const roundTracking = useRoundTracking();
  const { currentRoundId, isLoading: roundTrackingLoading, roundsById } = roundTracking;
  
  // NEW: Extract current round data safely
  const currentRoundData = roundsById?.[currentRoundId ?? ""];

  // Proper combined loading detection
  const isDataReady = !pageLoading && !roundStateLoading && !roundTrackingLoading &&
                      (isMainPage || (isDetailPage && currentRoundId === roundId && currentRoundData));

  useEffect(() => {
    if (isMainPage) {
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }

    if (isDetailPage && currentRoundId === roundId && !roundStateLoading && !roundTrackingLoading && currentRoundData) {
      setPageLoading(false);
    }
  }, [isMainPage, isDetailPage, roundId, currentRoundId, roundStateLoading, roundTrackingLoading, currentRoundData]);

  useEffect(() => {
    if (isDetailPage && roundId) {
      roundTracking.setCurrentRoundId(roundId);
    }
  }, [isDetailPage, roundId, roundTracking.setCurrentRoundId]);

  const handleBack = () => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    navigate(-1);
  };

  const retryLoading = () => {
    setPageLoading(true);
    resetLoading();
    if (roundId) {
      roundTracking.setCurrentRoundId(null);
      setTimeout(() => {
        roundTracking.setCurrentRoundId(roundId);
      }, 100);
    }
  };

  console.log("RoundTracking debug:", {
    pageLoading,
    roundStateLoading,
    roundTrackingLoading,
    currentRoundId,
    roundId,
    hasRoundData: !!currentRoundData
  });

  return (
    <ErrorBoundary>
      {!isDataReady ? (
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
      ) : isDetailPage && currentRoundId && currentRoundData ? (
        <RoundTrackingDetail
          onBack={handleBack}
          currentRoundId={currentRoundId}
          isLoading={false}
          loadingStage={loadingStage}
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
