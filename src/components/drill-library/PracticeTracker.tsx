
import { Button } from "@/components/ui/button";
import { Play, CircleStop, Pause, Play as Resume } from "lucide-react";
import { Drill } from "@/types/drill";
import { usePracticeTracking } from "@/hooks/usePracticeTracking";

interface PracticeTrackerProps {
  drill: Drill;
}

export const PracticeTracker = ({ drill }: PracticeTrackerProps) => {
  const { 
    isTracking, 
    isPaused,
    formattedTime, 
    startPractice, 
    pausePractice,
    completePractice 
  } = usePracticeTracking(drill);

  return (
    <div className="flex flex-col space-y-4">
      {isTracking ? (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-2xl font-mono bg-secondary/20 px-4 py-2 rounded-md min-w-[100px] text-center">
            {formattedTime}
          </div>
          <div className="flex gap-3 flex-1 justify-start">
            <Button 
              variant="outline"
              onClick={pausePractice}
              className="flex-1 sm:flex-none"
              size="sm"
            >
              {isPaused ? (
                <>
                  <Resume className="h-4 w-4" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              )}
            </Button>
            <Button 
              variant="destructive"
              onClick={completePractice}
              className="flex-1 sm:flex-none"
              size="sm"
            >
              <CircleStop className="h-4 w-4" />
              <span>Complete</span>
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          onClick={startPractice}
          className="w-full sm:w-auto"
        >
          <Play className="h-4 w-4" />
          Start Practice
        </Button>
      )}
    </div>
  );
};

