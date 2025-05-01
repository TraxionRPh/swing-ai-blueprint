
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useRoundScoreTracker } from "@/hooks/round-tracking/score/useRoundScoreTracker";

interface RoundTrackingDetailProps {
  onBack: () => void;
  currentRoundId: string | null;
  initialHoleNumber?: number | null;
  retryLoading: () => void;
  setDetailLoading?: (loading: boolean) => void;
  setDetailError?: (error: string | null) => void;
}

export const RoundTrackingDetail = ({
  onBack,
  currentRoundId,
  initialHoleNumber,
  retryLoading,
  setDetailLoading,
  setDetailError
}: RoundTrackingDetailProps) => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [courseId, setCourseId] = useState<string | undefined>(undefined);
  const [holeCount, setHoleCount] = useState(18);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { roundId } = useParams();
  
  // Use consolidated hook for score tracking
  const {
    currentHole,
    setCurrentHole,
    holeScores,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    currentHoleData,
    clearResumeData
  } = useRoundScoreTracker(currentRoundId, courseId);

  // Set initial values based on params
  useEffect(() => {
    console.log("RoundTrackingDetail mounted with roundId:", currentRoundId);
    
    if (currentRoundId) {
      // Exit loading state once we have a round ID
      setLocalLoading(false);
      if (setDetailLoading) setDetailLoading(false);
      
      // Set initial hole number from URL if provided
      if (initialHoleNumber && initialHoleNumber > 0 && initialHoleNumber <= holeCount) {
        console.log(`Setting initial hole number from URL: ${initialHoleNumber}`);
        setCurrentHole(initialHoleNumber);
      }
    } else {
      setLocalLoading(false);
      if (setDetailLoading) setDetailLoading(false);
    }
  }, [currentRoundId, initialHoleNumber, holeCount, setCurrentHole, setDetailLoading]);

  // Handle next button with final score view logic
  const handleNextWithFinalScore = () => {
    if (currentHole === holeCount) {
      console.log("Showing final score view");
      setShowFinalScore(true);
    } else {
      handleNext();
    }
  };

  // Handle back navigation with cleanup
  const handleBackNavigation = () => {
    console.log("Back navigation triggered");
    clearResumeData();
    onBack();
  };

  // If data is still loading, show a loading indicator
  if (localLoading) {
    return (
      <div className="space-y-6">
        <RoundTrackingHeader onBack={handleBackNavigation} />
        <Card>
          <CardContent className="py-6 flex justify-center">
            <Loading message={`Loading round data...`} minHeight={200} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the actual content when data is loaded
  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={handleBackNavigation} />
      
      {showFinalScore ? (
        <FinalScoreView 
          holeScores={holeScores}
          holeCount={holeCount}
          finishRound={() => navigate('/rounds')}
          onBack={onBack}
        />
      ) : (
        <HoleScoreView 
          currentHoleData={currentHoleData}
          handleHoleUpdate={handleHoleUpdate}
          handleNext={handleNextWithFinalScore}
          handlePrevious={handlePrevious}
          currentHole={currentHole}
          holeCount={holeCount}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};
