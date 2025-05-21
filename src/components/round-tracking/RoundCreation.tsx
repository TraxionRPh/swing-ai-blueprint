
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useRound } from "@/context/round"; 
import { RoundHeader } from "./RoundHeader";
import { CourseDetails } from "./CourseDetails";
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
    createRound,
    isLoading
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
    
    if (!selectedTeeId) {
      toast({
        title: "Tee Selection Required",
        description: "Please select a tee color before starting your round",
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
        console.log(`Round created successfully, ID: ${roundId}`);
        
        // Explicitly save the round ID to storage as a backup
        try {
          sessionStorage.setItem('current-round-id', roundId);
          localStorage.setItem('current-round-id', roundId);
          sessionStorage.setItem('current-hole-number', '1');
        } catch (storageError) {
          console.error("Failed to save round data to storage:", storageError);
        }
        
        // Navigate immediately to hole 1
        const trackUrl = `/rounds/track/${roundId}/1`;
        console.log(`Navigating to: ${trackUrl}`);
        navigate(trackUrl);
      } else {
        console.error("Failed to create round: No round ID returned");
        throw new Error("Failed to create round");
      }
    } catch (error) {
      console.error("Error creating round:", error);
      setIsProcessing(false);
      toast({
        title: "Error Creating Round",
        description: "There was a problem creating your round. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <Loading size="md" message="Loading course details..." />;
  }

  if (!selectedCourse) {
    return <Loading size="md" message="No course selected. Redirecting..." />;
  }

  return (
    <div className="space-y-6">
      <RoundHeader
        title="New Round"
        subtitle="Configure your round details"
        onBack={onBack}
      />
      
      <CourseDetails
        selectedCourse={selectedCourse}
        selectedTeeId={selectedTeeId}
        setSelectedTeeId={setSelectedTeeId}
        holeCount={holeCount}
        setHoleCount={setHoleCount}
        onStartRound={handleStartRound}
        isProcessing={isProcessing}
      />
    </div>
  );
};
