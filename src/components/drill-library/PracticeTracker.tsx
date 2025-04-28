
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
    <div className="flex items-center gap-4 mt-6">
      {isTracking ? (
        <>
          <span className="text-lg font-mono">{formattedTime}</span>
          <Button 
            variant="outline"
            onClick={pausePractice}
            className="flex items-center gap-2"
          >
            {isPaused ? (
              <>
                <Resume className="h-4 w-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            )}
          </Button>
          <Button 
            variant="destructive"
            onClick={completePractice}
            className="flex items-center gap-2"
          >
            <CircleStop className="h-4 w-4" />
            Complete Practice
          </Button>
        </>
      ) : (
        <Button 
          onClick={startPractice}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Start Practice
        </Button>
      )}
    </div>
  );
};
