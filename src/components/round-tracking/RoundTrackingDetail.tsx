
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useRoundScoreTracker } from "@/hooks/round-tracking/score/useRoundScoreTracker";
import { supabase } from "@/integrations/supabase/client";

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
  const [teeColor, setTeeColor] = useState<string | undefined>(undefined);
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
    clearResumeData,
    fetchCourseHoles
  } = useRoundScoreTracker(currentRoundId, courseId);

  // Fetch round details to get course ID and tee color
  useEffect(() => {
    const fetchRoundDetails = async () => {
      if (!currentRoundId || currentRoundId === 'new') return;
      
      try {
        console.log("Fetching round details for:", currentRoundId);
        const { data, error } = await supabase
          .from('rounds')
          .select(`
            course_id,
            hole_count,
            golf_courses (
              id,
              name,
              total_par
            )
          `)
          .eq('id', currentRoundId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          console.log("Round details:", data);
          setCourseId(data.course_id);
          if (data.hole_count) setHoleCount(data.hole_count);
          
          // Fetch tee color
          if (data.course_id) {
            const { data: teeData, error: teeError } = await supabase
              .from('course_tees')
              .select('color')
              .eq('course_id', data.course_id)
              .limit(1);
              
            if (!teeError && teeData && teeData.length > 0) {
              setTeeColor(teeData[0].color);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching round details:", error);
      } finally {
        setLocalLoading(false);
        if (setDetailLoading) setDetailLoading(false);
      }
    };
    
    fetchRoundDetails();
  }, [currentRoundId, setDetailLoading]);

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
          finishRound={() => {
            // Return a Promise<boolean> here instead of void
            return new Promise<boolean>((resolve) => {
              // Navigate after a short delay to allow for UI updates
              setTimeout(() => {
                navigate('/rounds');
                resolve(true);
              }, 100);
            });
          }}
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
          teeColor={teeColor}
          courseId={courseId}
          holeScores={holeScores}
        />
      )}
    </div>
  );
};
