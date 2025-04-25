
import { useState } from "react";
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { CourseSearch } from "@/components/round-tracking/CourseSearch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  name: string;
  courseRating: number;
  slopeRating: number;
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
  const [currentHole, setCurrentHole] = useState(1);
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [showCourseSearch, setShowCourseSearch] = useState(false);
  const { toast } = useToast();

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course);
    setShowCourseSearch(false);

    try {
      const { data: holes, error } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', course.id)
        .order('hole_number');

      if (error) throw error;

      // Initialize hole scores with course data
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

  const calculateTotals = () => {
    return holeScores.reduce((acc, hole) => ({
      score: acc.score + (hole.score || 0),
      putts: acc.putts + (hole.putts || 0),
      fairways: acc.fairways + (hole.fairwayHit ? 1 : 0),
      greens: acc.greens + (hole.greenInRegulation ? 1 : 0),
    }), { score: 0, putts: 0, fairways: 0, greens: 0 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Round Tracking</h1>
        <p className="text-muted-foreground">
          Track your round hole by hole
        </p>
      </div>

      {!selectedCourse ? (
        <Card>
          <CardHeader>
            <CardTitle>Select a Course</CardTitle>
            <CardDescription>
              Search for a course or enter course details manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CourseSearch onCourseSelect={handleCourseSelect} />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{selectedCourse.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Course Rating: {selectedCourse.courseRating} • 
                    Slope: {selectedCourse.slopeRating}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowCourseSearch(true)}>
                  Change Course
                </Button>
              </div>
            </CardContent>
          </Card>

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

      <Dialog open={showCourseSearch} onOpenChange={setShowCourseSearch}>
        <DialogContent>
          <DialogTitle>Select a Course</DialogTitle>
          <DialogDescription>
            Search for a course or enter course details manually
          </DialogDescription>
          <CourseSearch onCourseSelect={handleCourseSelect} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoundTracking;
