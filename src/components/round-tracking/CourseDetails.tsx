
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/types/round-tracking";
import { TeeSelection } from "./TeeSelection";
import { HoleCountSelection } from "./HoleCountSelection";

interface CourseDetailsProps {
  selectedCourse: Course | null;
  selectedTeeId: string | null;
  setSelectedTeeId: (teeId: string) => void;
  holeCount: number;
  setHoleCount: (count: number) => void;
  onStartRound: () => void;
}

export const CourseDetails = ({
  selectedCourse,
  selectedTeeId,
  setSelectedTeeId,
  holeCount,
  setHoleCount,
  onStartRound,
}: CourseDetailsProps) => {
  if (!selectedCourse) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">{selectedCourse.name}</h3>
          <p className="text-muted-foreground">
            {selectedCourse.city}, {selectedCourse.state}
          </p>
        </div>
        
        <TeeSelection 
          selectedCourse={selectedCourse}
          selectedTeeId={selectedTeeId}
          onTeeSelect={setSelectedTeeId}
        />
        
        <HoleCountSelection
          holeCount={holeCount}
          setHoleCount={setHoleCount}
        />
        
        <Button 
          className="w-full mt-6" 
          size="lg" 
          onClick={onStartRound}
          disabled={!selectedCourse || !selectedTeeId}
        >
          Start Round
        </Button>
      </CardContent>
    </Card>
  );
};
