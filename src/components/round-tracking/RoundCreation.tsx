
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-native";
import { useToast } from "@/hooks/use-toast";
import { useRound } from "@/context/round";
import { Course } from "@/types/round-tracking";
import { useCreateRound } from "@/context/round/operations/createRound";
import { Button } from "@/components/ui/button";

// Assuming we have this component, we need to modify the startRound function

export const RoundCreation = ({ 
  onBack, 
  holeCount = 18 // Default to 18 holes if not specified
}: { 
  onBack: () => void;
  holeCount?: number;
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedCourse, selectedTeeId, setHoleCount } = useRound();
  const { createRound, isCreating } = useCreateRound();
  const [loading, setLoading] = useState(false);

  // Set the hole count in context when component initializes
  useEffect(() => {
    setHoleCount(holeCount);
    console.log("Setting hole count in context:", holeCount);
  }, [holeCount, setHoleCount]);

  // Function to start a new round
  const startRound = async () => {
    if (!selectedCourse?.id) {
      toast({
        title: "No Course Selected",
        description: "Please select a course to track a round",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      console.log(`Starting round with course: ${selectedCourse.name}, tee: ${selectedTeeId}, holes: ${holeCount}`);
      
      const roundId = await createRound(
        selectedCourse.id, 
        selectedTeeId,
        holeCount // Pass the correct hole count to createRound
      );
      
      if (roundId) {
        console.log(`Round created with ID: ${roundId}, navigating to hole 1`);
        navigate(`/rounds/track/${roundId}/1`);
      } else {
        throw new Error("Failed to create round");
      }
    } catch (error) {
      console.error("Error starting round:", error);
      toast({
        title: "Error",
        description: "Could not start round tracking",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
      <div>
        {selectedCourse ? (
          <>
            <h2 className="text-lg font-semibold">
              {selectedCourse.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedCourse.city}, {selectedCourse.state}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {holeCount}-hole round
            </p>
          </>
        ) : (
          <p>No course selected.</p>
        )}
      </div>
      <Button disabled={isCreating || loading} onClick={startRound}>
        {isCreating || loading ? "Starting Round..." : "Start Round"}
      </Button>
    </div>
  );
};
