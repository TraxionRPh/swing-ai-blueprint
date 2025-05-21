
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useRound } from "@/context/round"; 
import { RoundHeader } from "./RoundHeader";
import { CourseDetails } from "./CourseDetails";
import { Loader2 } from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface CourseCreationProps {
  onBack: () => void;
  holeCount?: number;
}

export const RoundCreation = ({ onBack, holeCount = 18 }: CourseCreationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const { 
    setHoleCount, 
    selectedCourse, 
    setSelectedCourse,
    selectedTeeId,
    setSelectedTeeId,
    createRound
  } = useRound();
  
  // Set the hole count from props
  useEffect(() => {
    setHoleCount(holeCount);
  }, [holeCount, setHoleCount]);

  // Redirect if no course is selected
  useEffect(() => {
    if (!selectedCourse) {
      navigate('/rounds');
      toast({
        title: "No Course Selected",
        description: "Please select a course first",
      });
    }
  }, [selectedCourse, navigate, toast]);

  const handleStartRound = async () => {
    if (!selectedCourse) {
      toast({
        title: "Course Required",
        description: "Please select a course before starting your round",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Creating new round...");
    setIsProcessing(true);
    
    try {
      // Create a new round
      const roundId = await createRound(selectedCourse.id, selectedTeeId);
      
      if (roundId) {
        // Navigate to first hole
        navigate(`/rounds/${roundId}/1`);
      } else {
        throw new Error("Failed to create round");
      }
    } catch (error) {
      console.error("Error creating round:", error);
      toast({
        title: "Error Creating Round",
        description: "There was a problem creating your round. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedCourse) {
    return <Loading size="md" message="Loading course details..." />;
  }

  return (
    <div className="space-y-6">
      <RoundHeader
        title="New Round"
        subtitle="Configure your round details"
        onBack={onBack}
      />
      
      {/* Selected Course Details */}
      {selectedCourse && (
        <CourseDetails
          selectedCourse={selectedCourse}
          selectedTeeId={selectedTeeId}
          setSelectedTeeId={setSelectedTeeId}
          holeCount={holeCount}
          setHoleCount={setHoleCount}
          onStartRound={handleStartRound}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};
