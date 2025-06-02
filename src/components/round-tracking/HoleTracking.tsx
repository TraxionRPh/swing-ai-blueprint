
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-native";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { HoleData } from "@/types/round-tracking";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/ui/loading";
import { useRound } from "@/context/round";
import { useHoleScores } from "@/hooks/round-tracking/score/useHoleScores";

// Import the new components
import { RoundStatsSummary } from "./hole/RoundStatsSummary";
import { HoleHeader } from "./hole/HoleHeader";
import { HoleInputForm } from "./hole/HoleInputForm";
import { HoleFooterActions } from "./hole/HoleFooterActions";

const HoleTracking = () => {
  const navigate = useNavigate();
  const { roundId, holeNumber: holeNumberParam } = useParams<{ roundId: string; holeNumber: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use the round context if available
  const roundContext = useRound();
  
  const [currentHole, setCurrentHole] = useState<number>(parseInt(holeNumberParam || "1"));
  const [holeCount, setHoleCount] = useState<number>(18); // Default to 18
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [courseDetails, setCourseDetails] = useState<{ name: string; city: string; state: string; par?: number } | null>(null);
  const [allHoleScores, setAllHoleScores] = useState<HoleData[]>([]);
  
  const [holeData, setHoleData] = useState<HoleData>({
    holeNumber: currentHole,
    par: 4, // Default par
    distance: 0,
    score: 0,
    putts: 0,
    fairwayHit: false,
    greenInRegulation: false,
  });
  
  // Calculate round stats based on all hole scores + current hole data
  const roundStats = useMemo(() => {
    // Create a copy of all hole scores
    const allScores = [...allHoleScores];
    
    // Find if current hole already exists in scores
    const currentHoleIndex = allScores.findIndex(h => h.holeNumber === currentHole);
    
    // Either update or add current hole data
    if (currentHoleIndex >= 0) {
      allScores[currentHoleIndex] = holeData;
    } else if (holeData.score || holeData.putts || holeData.fairwayHit || holeData.greenInRegulation) {
      // Only add current hole if it has some data
      allScores.push(holeData);
    }
    
    // Calculate stats from all holes, excluding par 3s from fairway count
    const fairwayEligibleHoles = allScores.filter(hole => hole.par && hole.par > 3);
    const fairwaysHit = fairwayEligibleHoles.filter(hole => hole.fairwayHit).length;
    const totalFairways = fairwayEligibleHoles.length;
    
    return {
      totalStrokes: allScores.reduce((sum, hole) => sum + (hole.score || 0), 0),
      totalPutts: allScores.reduce((sum, hole) => sum + (hole.putts || 0), 0),
      fairwaysHit,
      totalFairways,
      greensInRegulation: allScores.filter(hole => hole.greenInRegulation).length,
      totalGreens: allScores.length,
    };
  }, [allHoleScores, holeData, currentHole]);
  
  // Load round information on mount
  useEffect(() => {
    if (roundId) {
      loadRoundInfo();
      loadHoleInfo(parseInt(holeNumberParam || "1"));
    }
  }, [roundId]);
  
  // Update hole data when hole number changes
  useEffect(() => {
    if (parseInt(holeNumberParam || "1") !== currentHole) {
      setCurrentHole(parseInt(holeNumberParam || "1"));
      loadHoleInfo(parseInt(holeNumberParam || "1"));
    }
  }, [holeNumberParam]);
  
  // Load round information from database
  const loadRoundInfo = async () => {
    try {
      setIsLoading(true);
      
      if (!roundId) return;
      
      // Get round details
      const { data: roundData, error: roundError } = await supabase
        .from("rounds")
        .select("hole_count, course_id, tee_id")
        .eq("id", roundId)
        .single();
      
      if (roundError) throw roundError;
      
      if (roundData) {
        // Make sure to use the actual hole_count from the database
        const actualHoleCount = roundData.hole_count || 18;
        setHoleCount(actualHoleCount);
        console.log("Setting hole count from database:", actualHoleCount);
        
        // Get course details
        const { data: courseData, error: courseError } = await supabase
          .from("golf_courses")
          .select("name, city, state, total_par")
          .eq("id", roundData.course_id)
          .single();
        
        if (courseError) throw courseError;
        
        setCourseDetails(courseData || null);
        
        // Get all hole scores to calculate round stats
        const { data: allHoleScores, error: allScoresError } = await supabase
          .from("hole_scores")
          .select("*")
          .eq("round_id", roundId);
          
        if (!allScoresError && allHoleScores) {
          // Convert database format to our HoleData format
          const formattedScores: HoleData[] = allHoleScores.map(hole => ({
            holeNumber: hole.hole_number,
            par: 4, // Default as we don't store this
            distance: 0,
            score: hole.score || 0,
            putts: hole.putts || 0,
            fairwayHit: !!hole.fairway_hit,
            greenInRegulation: !!hole.green_in_regulation
          }));
          
          setAllHoleScores(formattedScores);
        }
      }
    } catch (error) {
      console.error("Error loading round info:", error);
      toast({
        title: "Error loading round",
        description: "Could not load round information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load hole information from database
  const loadHoleInfo = async (holeNum: number) => {
    try {
      // Try to get existing score for this hole
      const { data: holeScoreData, error: holeScoreError } = await supabase
        .from("hole_scores")
        .select("*")
        .eq("round_id", roundId)
        .eq("hole_number", holeNum)
        .single();
      
      if (holeScoreError && holeScoreError.code !== 'PGRST116') { // No rows returned is not an error
        throw holeScoreError;
      }
      
      // Try to get hole information from the course
      const { data: roundData } = await supabase
        .from("rounds")
        .select("course_id")
        .eq("id", roundId)
        .single();
      
      if (roundData?.course_id) {
        const { data: holeData } = await supabase
          .from("course_holes")
          .select("par, distance_yards")
          .eq("course_id", roundData.course_id)
          .eq("hole_number", holeNum)
          .single();
        
        // Update hole data with course information
        setHoleData(prev => ({
          ...prev,
          holeNumber: holeNum,
          par: holeData?.par || 4,
          distance: holeData?.distance_yards || 0,
          // If we have saved scores, use them
          score: holeScoreData?.score || 0,
          putts: holeScoreData?.putts || 0,
          fairwayHit: holeScoreData?.fairway_hit || false,
          greenInRegulation: holeScoreData?.green_in_regulation || false,
        }));
      } else {
        // Just update with the hole number if we couldn't get course data
        setHoleData(prev => ({
          ...prev,
          holeNumber: holeNum,
          // If we have saved scores, use them
          score: holeScoreData?.score || 0,
          putts: holeScoreData?.putts || 0,
          fairwayHit: holeScoreData?.fairway_hit || false,
          greenInRegulation: holeScoreData?.green_in_regulation || false,
        }));
      }
    } catch (error) {
      console.error(`Error loading hole ${holeNum} info:`, error);
    }
  };
  
  // Save hole data to database
  const saveHoleData = async () => {
    if (!roundId || !holeData.score) {
      toast({
        title: "Score required",
        description: "Please enter a score before saving",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from("hole_scores")
        .upsert({
          round_id: roundId,
          hole_number: currentHole,
          score: holeData.score || 0,
          putts: holeData.putts || 0,
          fairway_hit: holeData.fairwayHit,
          green_in_regulation: holeData.greenInRegulation
        }, {
          onConflict: 'round_id,hole_number'
        });
      
      if (error) throw error;
      
      // Update the allHoleScores with current hole data
      setAllHoleScores(prev => {
        const updated = [...prev];
        const existingIndex = updated.findIndex(h => h.holeNumber === currentHole);
        
        if (existingIndex >= 0) {
          updated[existingIndex] = holeData;
        } else {
          updated.push(holeData);
        }
        
        return updated;
      });
      
      toast({
        title: "Score saved",
        description: `Hole ${currentHole} score saved successfully`
      });
      
      // Navigate to next hole or review page
      if (currentHole === holeCount) {
        // Go to review page after last hole
        navigate(`/rounds/review/${roundId}`);
      } else {
        // Go to next hole
        navigate(`/rounds/track/${roundId}/${currentHole + 1}`);
      }
    } catch (error) {
      console.error("Error saving hole data:", error);
      toast({
        title: "Error saving score",
        description: "Could not save your score",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle previous hole navigation
  const goToPreviousHole = () => {
    if (currentHole > 1) {
      navigate(`/rounds/track/${roundId}/${currentHole - 1}`);
    }
  };
  
  // Handle input changes
  const handleInputChange = (field: keyof HoleData, value: any) => {
    setHoleData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Validate and handle score input change
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input or valid numbers
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      handleInputChange('score', value === "" ? 0 : parseInt(value));
    }
  };
  
  // Validate and handle putts input change
  const handlePuttsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input or valid numbers (including 0)
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      handleInputChange('putts', value === "" ? 0 : parseInt(value));
    }
  };
  
  // Validate and handle distance input change
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input or valid numbers (including 0)
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      handleInputChange('distance', value === "" ? 0 : parseInt(value));
    }
  };
  
  const handleParChange = (value: string) => {
    if (value) {
      handleInputChange('par', parseInt(value));
    }
  };
  
  if (isLoading) {
    return <Loading size="lg" message="Loading hole information..." />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hole {currentHole}</h1>
          <p className="text-muted-foreground">
            {courseDetails?.name || "Loading course..."} - {holeCount} holes
          </p>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Stat Tiles */}
          <RoundStatsSummary
            totalStrokes={roundStats.totalStrokes}
            totalPutts={roundStats.totalPutts}
            fairwaysHit={roundStats.fairwaysHit}
            totalFairways={roundStats.totalFairways}
            greensInRegulation={roundStats.greensInRegulation}
            totalGreens={roundStats.totalGreens}
          />
          
          <Separator />
          
          <div className="grid grid-cols-1 gap-6">
            {/* Hole information */}
            <HoleHeader
              currentHole={currentHole}
              holeCount={holeCount}
              par={holeData.par}
              onParChange={handleParChange}
              goToPreviousHole={goToPreviousHole}
            />
            
            {/* Hole Data Entry */}
            <HoleInputForm
              holeData={holeData}
              handleDistanceChange={handleDistanceChange}
              handleScoreChange={handleScoreChange}
              handlePuttsChange={handlePuttsChange}
              handleInputChange={handleInputChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <HoleFooterActions
            isSaving={isSaving}
            currentHole={currentHole}
            holeCount={holeCount}
            hasScore={!!holeData.score}
            onCancel={() => navigate("/rounds")}
            onSave={saveHoleData}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default HoleTracking;
