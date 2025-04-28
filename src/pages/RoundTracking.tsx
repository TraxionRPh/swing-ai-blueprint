
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import { FinalScoreCard } from "@/components/round-tracking/FinalScoreCard";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { InProgressRoundCard } from "@/components/round-tracking/InProgressRoundCard";
import { supabase } from "@/integrations/supabase/client";
import type { Course } from "@/types/round-tracking";
import { useToast } from "@/hooks/use-toast";

const RoundTracking = () => {
  const navigate = useNavigate();
  const { roundId } = useParams();
  const { toast } = useToast();
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    selectedCourse,
    selectedTee,
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
    setCurrentRoundId,
    deleteRound
  } = useRoundTracking();

  // Load course info when round ID changes
  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!currentRoundId) return;
      
      setIsLoading(true);
      try {
        const { data: round, error } = await supabase
          .from('rounds')
          .select(`
            course_id,
            hole_count,
            golf_courses (
              id,
              name,
              city,
              state,
              total_par,
              course_tees (*)
            )
          `)
          .eq('id', currentRoundId)
          .single();
          
        if (error) throw error;
        
        if (round?.golf_courses) {
          setCourseName(round.golf_courses.name);
          setHoleCount(round.hole_count || 18);
          
          // Set selected course if we have the data
          if (round.golf_courses) {
            const courseData: Course = {
              id: round.golf_courses.id,
              name: round.golf_courses.name,
              city: round.golf_courses.city || '',
              state: round.golf_courses.state || '',
              course_tees: round.golf_courses.course_tees || [],
              total_par: round.golf_courses.total_par
            };
            handleCourseSelect(courseData);
          }
        }
      } catch (error) {
        console.error('Error fetching course info:', error);
        toast({
          title: "Error",
          description: "Could not load round data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseInfo();
  }, [currentRoundId, handleCourseSelect, setHoleCount, toast]);

  useEffect(() => {
    console.log('RoundTracking component state:', {
      roundId,
      selectedCourse,
      currentHoleData,
      holeScores: holeScores.length,
      currentHole,
      holeCount
    });
    
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    }
  }, [roundId, selectedCourse, currentHoleData, holeScores, currentHole, holeCount]);

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

  const handleCourseSelection = (course: Course, selectedHoleCount?: number) => {
    if (selectedHoleCount) {
      setHoleCount(selectedHoleCount);
      sessionStorage.setItem('current-hole-count', selectedHoleCount.toString());
      handleCourseSelect(course);
    } else if (!holeCount) {
      return;
    } else {
      handleCourseSelect(course);
    }
  };

  const handleDeleteRound = () => {
    if (currentRoundId) {
      deleteRound(currentRoundId);
      navigate('/rounds');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBack}
            className="text-muted-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Round Tracking</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading round data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleBack}
          className="text-muted-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Round Tracking</h1>
          <p className="text-muted-foreground">
            Track your round hole by hole
          </p>
        </div>
      </div>

      {!selectedCourse && currentRoundId && !isLoading && (
        <InProgressRoundCard
          roundId={currentRoundId}
          courseName={courseName || "Loading course..."}
          lastHole={holeScores.filter(h => h.score > 0).length}
          holeCount={holeCount || 18}
          onDelete={handleDeleteRound}
        />
      )}

      {!selectedCourse && !currentRoundId && (
        <CourseSelector
          selectedCourse={selectedCourse}
          selectedTee={selectedTee}
          onCourseSelect={handleCourseSelection}
          onTeeSelect={setSelectedTee}
        />
      )}

      {selectedCourse && !holeCount && (
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-4">How many holes are you playing?</h3>
          <RadioGroup 
            defaultValue="18" 
            className="grid grid-cols-2 gap-4"
            onValueChange={(value) => {
              const count = parseInt(value);
              setHoleCount(count);
              sessionStorage.setItem('current-hole-count', count.toString());
              handleCourseSelect(selectedCourse);
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="9" id="nine" />
              <Label htmlFor="nine">9 Holes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="18" id="eighteen" />
              <Label htmlFor="eighteen">18 Holes</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {selectedCourse && holeCount > 0 && (
        <>
          {holeScores.length > 0 && (
            <ScoreSummary holeScores={holeScores.slice(0, holeCount)} />
          )}
          
          <HoleScoreCard
            holeData={currentHoleData}
            onUpdate={handleHoleUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={currentHole === 1}
            isLast={currentHole === holeCount}
            teeColor={currentTeeColor}
            courseId={selectedCourse.id}
            isSaving={isSaving}
          />

          <FinalScoreCard
            holeScores={holeScores.slice(0, holeCount)}
            isOpen={showFinalScore}
            onConfirm={handleConfirmRound}
            onCancel={() => setShowFinalScore(false)}
            holeCount={holeCount}
          />
        </>
      )}
    </div>
  );
};

export default RoundTracking;
