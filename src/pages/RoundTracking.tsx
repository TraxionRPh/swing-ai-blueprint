import { useNavigate } from "react-router-dom";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState, useEffect, useCallback } from "react";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { ActiveRoundContent } from "@/components/round-tracking/score/ActiveRoundContent";
import { RoundsDisplay } from "@/components/round-tracking/RoundsDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { LoadingState } from "@/components/round-tracking/loading/LoadingState";
import { useToast } from "@/hooks/use-toast";

const RoundTracking = () => {
  const navigate = useNavigate();
  const [showFinalScore, setShowFinalScore] = useState(false);
  const { toast } = useToast();
  
  // Only load the complex hook if we're not on the main page
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  const roundId = isDetailPage ? window.location.pathname.split('/').pop() : null;
  
  // Improved logging to diagnose issues
  useEffect(() => {
    console.log("RoundTracking Page - Current path:", window.location.pathname);
    console.log("isMainPage:", isMainPage, "isDetailPage:", isDetailPage, "roundId:", roundId);
  }, [isMainPage, isDetailPage, roundId]);
  
  // Simplified loading for the main page
  const [pageLoading, setPageLoading] = useState(!isMainPage);
  const [loadRetries, setLoadRetries] = useState(0);
  const maxRetries = 3;
  
  useEffect(() => {
    // If we're on the main rounds page, set loading to false after a short delay
    if (isMainPage) {
      const timer = setTimeout(() => setPageLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isMainPage]);
  
  // Only use the complex hook when necessary (for detail pages or active rounds)
  const roundTracking = useRoundTracking();
  
  const {
    selectedCourse,
    currentHole,
    holeScores,
    currentRoundId,
    handleCourseSelect,
    setSelectedTee,
    handleHoleUpdate,
    handleNext: moveToNextHole,
    handlePrevious,
    currentTeeColor,
    currentHoleData,
    isSaving,
    finishRound,
    holeCount,
    setHoleCount,
    isLoading: hookIsLoading
  } = roundTracking;

  // Callback for retry functionality
  const retryLoading = useCallback(() => {
    console.log("Retrying load attempt manually:", loadRetries + 1);
    setLoadRetries(prev => prev + 1);
    
    // If we're on a specific round page, force navigation to refresh the page
    if (isDetailPage && roundId && loadRetries >= 1) {
      console.log("Hard refresh triggered after multiple retry attempts");
      toast({
        title: "Refreshing page",
        description: "Attempting to resolve loading issues"
      });
      
      // Use a small delay to allow the toast to show
      setTimeout(() => {
        window.location.href = `/rounds/${roundId}`;
      }, 800);
    }
  }, [loadRetries, isDetailPage, roundId, toast]);

  // Force timeout of loading state after 10 seconds to prevent infinite loading
  useEffect(() => {
    if (!isDetailPage || !hookIsLoading) return;
    
    const forceTimeout = setTimeout(() => {
      if (hookIsLoading && loadRetries < maxRetries) {
        console.log("Forcing retry of round loading after timeout");
        setLoadRetries(prev => prev + 1);
        // Force reload the page if we're still loading after multiple retries
        if (loadRetries >= maxRetries - 1) {
          toast({
            title: "Loading issue detected",
            description: "Refreshing the page to resolve loading issues",
            variant: "destructive",
          });
          setTimeout(() => window.location.href = `/rounds/${roundId}`, 1500);
        }
      }
    }, 9000); // 9 seconds timeout (reduced from 10)
    
    return () => clearTimeout(forceTimeout);
  }, [hookIsLoading, loadRetries, isDetailPage, toast, roundId, maxRetries]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = () => {
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    } else {
      moveToNextHole();
    }
  };

  const handleConfirmRound = async () => {
    const success = await finishRound();
    setShowFinalScore(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleHoleCountSelect = (count: number) => {
    setHoleCount(count);
    sessionStorage.setItem('current-hole-count', count.toString());
  };

  // Main page - show rounds display and course selector
  if (isMainPage) {
    return (
      <div className="space-y-6">
        <RoundTrackingHeader 
          onBack={handleBack} 
          subtitle="View your rounds and start tracking new ones"
        />
        
        {pageLoading ? (
          <Card>
            <CardContent className="pt-6 flex justify-center items-center">
              <Loading message="Loading rounds..." minHeight={150} size="md" />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Rounds display showing in-progress rounds */}
            <RoundsDisplay 
              onCourseSelect={(course, courseHoleCount) => {
                if (courseHoleCount) {
                  setHoleCount(courseHoleCount);
                }
                handleCourseSelect(course);
              }} 
            />
            
            {/* Course selector to start a new round */}
            <CourseSelector
              selectedCourse={selectedCourse}
              selectedTee={roundTracking.selectedTee}
              onCourseSelect={handleCourseSelect}
              onTeeSelect={setSelectedTee}
            />
          </>
        )}
      </div>
    );
  }

  // Round detail page - show specific round
  if (isDetailPage && currentRoundId) {
    console.log("Rendering round detail page for:", currentRoundId);
    console.log("hookIsLoading:", hookIsLoading, "holeScores:", holeScores.length);
    
    return (
      <div className="space-y-6">
        <RoundTrackingHeader onBack={handleBack} />
        
        {hookIsLoading ? (
          <LoadingState 
            onBack={handleBack} 
            message={`Loading round data (attempt ${loadRetries + 1})...`}
            retryFn={retryLoading}
            roundId={currentRoundId}
          />
        ) : (
          <ActiveRoundContent
            holeScores={holeScores}
            currentHoleData={currentHoleData}
            onHoleUpdate={handleHoleUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentHole={currentHole}
            holeCount={holeCount || 18}
            teeColor={currentTeeColor}
            courseId={selectedCourse?.id}
            isSaving={isSaving}
            showFinalScore={showFinalScore}
            onConfirmRound={handleConfirmRound}
            onCancelFinalScore={() => setShowFinalScore(false)}
          />
        )}
      </div>
    );
  }

  // Loading state or no round ID yet
  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={handleBack} />
      
      <LoadingState 
        onBack={handleBack} 
        message="Preparing round data..."
        retryFn={retryLoading}
        roundId={roundId || undefined}
      />
    </div>
  );
};

export default RoundTracking;
