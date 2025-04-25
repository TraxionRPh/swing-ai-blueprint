
import { useState } from "react";
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  name: string;
  city: string;
  state: string;
  course_tees: {
    id: string;
    name: string;
    color: string;
    course_rating: number;
    slope_rating: number;
  }[];
}

interface HoleData {
  holeNumber: number;
  par: number;
  distance: number;
  score: number;
  putts: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
}

const RoundTracking = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTee, setSelectedTee] = useState<string | null>(null);
  const [currentHole, setCurrentHole] = useState(1);
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const { toast } = useToast();

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    // Fetch hole data after setting the course
    fetchCourseHoles(course.id);
  };

  const fetchCourseHoles = async (courseId: string) => {
    try {
      const { data: holes, error } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');

      if (error) throw error;

      setHoleScores(holes.map((hole: any) => ({
        holeNumber: hole.hole_number,
        par: hole.par,
        distance: hole.distance_yards,
        score: 0,
        putts: 0
      })));
    } catch (error) {
      toast({
        title: "Error loading course data",
        description: "Please try again or enter the data manually",
        variant: "destructive"
      });
    }
  };

  const handleHoleUpdate = (data: HoleData) => {
    setHoleScores(prev => 
      prev.map(hole => 
        hole.holeNumber === data.holeNumber ? data : hole
      )
    );
  };

  const handleNext = () => {
    if (currentHole < 18) setCurrentHole(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentHole > 1) setCurrentHole(prev => prev - 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Round Tracking</h1>
        <p className="text-muted-foreground">
          Track your round hole by hole
        </p>
      </div>

      <CourseSelector
        selectedCourse={selectedCourse}
        selectedTee={selectedTee}
        onCourseSelect={handleCourseSelect}
        onTeeSelect={setSelectedTee}
      />

      {selectedCourse && holeScores.length > 0 && (
        <>
          <ScoreSummary holeScores={holeScores} />
          
          {holeScores[currentHole - 1] && (
            <HoleScoreCard
              holeData={holeScores[currentHole - 1]}
              onUpdate={handleHoleUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirst={currentHole === 1}
              isLast={currentHole === 18}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RoundTracking;
