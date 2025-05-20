
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Course, CourseTee, HoleData, RoundData } from "@/types/round-tracking";

interface RoundContextType {
  // Current round state
  currentRoundId: string | null;
  setCurrentRoundId: (id: string | null) => void;
  currentHoleNumber: number;
  setCurrentHoleNumber: (holeNumber: number) => void;
  holeCount: number;
  setHoleCount: (count: number) => void;
  
  // Course and tee state
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  selectedTeeId: string | null;
  setSelectedTeeId: (teeId: string | null) => void;
  
  // Hole data management
  holeScores: HoleData[];
  setHoleScores: (scores: HoleData[]) => void;
  updateHoleScore: (holeData: HoleData) => Promise<boolean>;
  
  // Round operations
  createRound: (courseId: string, teeId: string | null) => Promise<string | null>;
  finishRound: () => Promise<boolean>;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  saveInProgress: boolean;
}

const RoundContext = createContext<RoundContextType | undefined>(undefined);

export const RoundProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const [currentHoleNumber, setCurrentHoleNumber] = useState<number>(1);
  const [holeCount, setHoleCount] = useState<number>(18);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string | null>(null);
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  
  // Initialize hole scores when hole count changes
  useEffect(() => {
    if (holeCount) {
      initializeHoleScores();
    }
  }, [holeCount]);
  
  // Fetch hole scores when round ID changes
  useEffect(() => {
    if (currentRoundId && currentRoundId !== 'new') {
      fetchRoundData();
    }
  }, [currentRoundId]);
  
  // Initialize empty hole scores based on hole count
  const initializeHoleScores = () => {
    const newScores = Array.from({ length: holeCount }, (_, i) => ({
      holeNumber: i + 1,
      par: 4, // Default par
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    }));
    
    setHoleScores(newScores);
  };
  
  // Fetch round data from Supabase
  const fetchRoundData = async () => {
    if (!currentRoundId) return;
    
    setIsLoading(true);
    
    try {
      // Fetch round details
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select(`
          *,
          golf_courses:course_id (
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
      
      if (roundError) throw roundError;
      
      if (roundData) {
        // Set course and tee
        setSelectedCourse(roundData.golf_courses);
        setSelectedTeeId(roundData.tee_id);
        setHoleCount(roundData.hole_count || 18);
        
        // Fetch hole scores
        const { data: holeData, error: holeError } = await supabase
          .from('hole_scores')
          .select('*')
          .eq('round_id', currentRoundId)
          .order('hole_number');
        
        if (holeError) throw holeError;
        
        // Format hole scores
        if (holeData) {
          const formattedScores = Array.from({ length: roundData.hole_count || 18 }, (_, i) => {
            const holeNumber = i + 1;
            const existingScore = holeData.find(h => h.hole_number === holeNumber);
            
            return {
              holeNumber,
              par: existingScore?.par || 4,
              distance: 0, // We'll fetch this separately if needed
              score: existingScore?.score || 0,
              putts: existingScore?.putts || 0,
              fairwayHit: existingScore?.fairway_hit || false,
              greenInRegulation: existingScore?.green_in_regulation || false
            };
          });
          
          setHoleScores(formattedScores);
        }
      }
    } catch (error) {
      console.error("Error fetching round data:", error);
      toast({
        title: "Error loading round data",
        description: "Could not load round details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new round
  const createRound = async (courseId: string, teeId: string | null) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a round",
        variant: "destructive"
      });
      return null;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('rounds')
        .insert({
          user_id: user.id,
          course_id: courseId,
          tee_id: teeId,
          hole_count: holeCount,
          date: new Date().toISOString().split('T')[0]
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setCurrentRoundId(data.id);
        return data.id;
      }
      
      return null;
    } catch (error) {
      console.error("Error creating round:", error);
      toast({
        title: "Error Creating Round",
        description: "Could not create a new round. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update a hole score
  const updateHoleScore = async (holeData: HoleData) => {
    if (!currentRoundId || currentRoundId === 'new') {
      return true; // No need to save for new rounds
    }
    
    setSaveInProgress(true);
    
    try {
      const { error } = await supabase
        .from('hole_scores')
        .upsert({
          round_id: currentRoundId,
          hole_number: holeData.holeNumber,
          score: holeData.score,
          putts: holeData.putts,
          fairway_hit: holeData.fairwayHit,
          green_in_regulation: holeData.greenInRegulation,
          par: holeData.par
        }, {
          onConflict: 'round_id,hole_number'
        });
      
      if (error) throw error;
      
      // Update the hole scores in state
      setHoleScores(prev => {
        const newScores = [...prev];
        const index = newScores.findIndex(h => h.holeNumber === holeData.holeNumber);
        
        if (index >= 0) {
          newScores[index] = holeData;
        } else {
          newScores.push(holeData);
        }
        
        return newScores;
      });
      
      return true;
    } catch (error) {
      console.error("Error updating hole score:", error);
      toast({
        title: "Error Saving Score",
        description: "Could not save hole score. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaveInProgress(false);
    }
  };
  
  // Finish the round and calculate totals
  const finishRound = async () => {
    if (!currentRoundId || currentRoundId === 'new') {
      toast({
        title: "Cannot Finish Round",
        description: "Round must be saved first",
        variant: "destructive"
      });
      return false;
    }
    
    setSaveInProgress(true);
    
    try {
      // Calculate totals
      const totals = holeScores.reduce((acc, hole) => ({
        score: acc.score + (hole.score || 0),
        putts: acc.putts + (hole.putts || 0),
        fairways: acc.fairways + (hole.fairwayHit ? 1 : 0),
        greens: acc.greens + (hole.greenInRegulation ? 1 : 0),
      }), { score: 0, putts: 0, fairways: 0, greens: 0 });
      
      // Update round totals
      const { error } = await supabase
        .from('rounds')
        .update({
          total_score: totals.score,
          total_putts: totals.putts,
          fairways_hit: totals.fairways,
          greens_in_regulation: totals.greens,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentRoundId);
        
      if (error) throw error;
      
      toast({
        title: "Round Completed",
        description: "Your round has been saved successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error finishing round:", error);
      toast({
        title: "Error Saving Round",
        description: "Could not save round data. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaveInProgress(false);
    }
  };
  
  const value = {
    currentRoundId,
    setCurrentRoundId,
    currentHoleNumber,
    setCurrentHoleNumber,
    holeCount,
    setHoleCount,
    selectedCourse,
    setSelectedCourse,
    selectedTeeId,
    setSelectedTeeId,
    holeScores,
    setHoleScores,
    updateHoleScore,
    createRound,
    finishRound,
    isLoading,
    setIsLoading,
    saveInProgress
  };
  
  return <RoundContext.Provider value={value}>{children}</RoundContext.Provider>;
};

export const useRound = () => {
  const context = useContext(RoundContext);
  if (context === undefined) {
    throw new Error("useRound must be used within a RoundProvider");
  }
  return context;
};
