import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-native";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Drill } from "@/types/drill";
import { DrillCard } from "@/components/drill-library/DrillCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { PlanDurationDialog } from "@/components/practice-plans/PlanDurationDialog";
import { usePracticePlanGeneration } from "@/hooks/usePracticePlanGeneration";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const PracticePlanGenerator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDrills, setSelectedDrills] = useState<Drill[]>([]);
  const [showDurationDialog, setShowDurationDialog] = useState(false);
  const [planDuration, setPlanDuration] = useState("1");
  const { generatePlan, isGenerating } = usePracticePlanGeneration();

  // Get problem and focus area from location state if available
  const focusArea = location.state?.focusArea;
  const problem = location.state?.problem;

  // If we have a problem from state, show duration dialog automatically
  useEffect(() => {
    if (problem) {
      setShowDurationDialog(true);
    }
  }, [problem]);

  // Parse drill IDs from the URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const drillIdsParam = searchParams.get('drills');
  const drillIds = drillIdsParam ? drillIdsParam.split(',') : [];

  // Fetch drill data based on the IDs
  const { data: drills, isLoading } = useQuery({
    queryKey: ['selected-drills', drillIds],
    queryFn: async () => {
      if (!drillIds.length) return [];
      
      const { data, error } = await supabase
        .from('drills')
        .select('*')
        .in('id', drillIds);
      
      if (error) throw error;
      return data as Drill[];
    },
    enabled: drillIds.length > 0
  });

  // Set selected drills once data is loaded
  useEffect(() => {
    if (drills) {
      // Maintain the original order from drillIds
      const orderedDrills = drillIds
        .map(id => drills.find(d => d.id === id))
        .filter(d => d) as Drill[];
      
      setSelectedDrills(orderedDrills);
    }
  }, [drills, drillIds]);

  // Function to determine drill category for accurate practice plan generation
  const getDrillCategory = useCallback((drill: Drill): string => {
    if (!drill) return 'general';
    
    // Use strict category check - most reliable indicator
    if (drill.category) {
      const category = drill.category.toLowerCase();
      if (category === 'putting' || category.includes('putt')) {
        return 'putting';
      }
      if (category === 'driving' || category.includes('driver') || category.includes('tee')) {
        return 'driving';
      }
      if (category.includes('iron') || category.includes('approach')) {
        return 'iron_play';
      }
      if (category.includes('chip') || category.includes('pitch') || category.includes('short game')) {
        return 'short_game';
      }
      if (category.includes('bunker') || category.includes('sand')) {
        return 'bunker';
      }
    }
    
    // No clear category found
    return 'general';
  }, []);

  // Determine the dominant drill category for all selected drills
  const getDominantCategory = useCallback((drills: Drill[]): string => {
    if (!drills?.length) return 'general';
    
    const categoryCounts: Record<string, number> = {
      putting: 0,
      driving: 0,
      iron_play: 0,
      short_game: 0,
      bunker: 0,
      general: 0
    };
    
    drills.forEach(drill => {
      const category = getDrillCategory(drill);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    let maxCount = 0;
    let dominantCategory = 'general';
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantCategory = category;
      }
    });
    
    return dominantCategory;
  }, [getDrillCategory]);

  const generatePracticeIssue = () => {
    if (selectedDrills.length === 0 && !problem) {
      toast({
        title: "No drills or issue selected",
        description: "Please select at least one drill for your practice plan or use a specific issue",
        variant: "destructive"
      });
      return;
    }

    setShowDurationDialog(true);
  };

  const handleConfirmDuration = async () => {
    setShowDurationDialog(false);
    
    try {
      let issue = problem;
      
      // If no problem was passed from AI Analysis, generate one from selected drills
      if (!issue && selectedDrills.length > 0) {
        // Extract key information from the selected drills to build an issue description
        const focus = selectedDrills.flatMap(d => d.focus || []);
        const categories = [...new Set(selectedDrills.map(d => d.category))];
        
        // Determine the dominant category for these drills
        const dominantCategory = getDominantCategory(selectedDrills);
        
        // Generate an issue based on the selected drills
        issue = `Create a practice plan focusing on ${focus.slice(0, 3).join(', ')} using drills for ${categories.join(' and ')}. Include drills: ${selectedDrills.map(d => d.title).join(', ')}`;
        
        // Add explicit category instruction based on dominant drill type
        switch (dominantCategory) {
          case 'putting':
            issue = `STRICTLY PUTTING ONLY: ${issue} - THIS IS A PUTTING-ONLY PRACTICE PLAN: ONLY use putting drills with category="putting".`;
            break;
          case 'driving':
            issue = `STRICTLY DRIVING ONLY: ${issue} - THIS IS A DRIVING-ONLY PRACTICE PLAN: ONLY use driving drills related to tee shots and long game.`;
            break;
          case 'iron_play':
            issue = `STRICTLY IRON PLAY ONLY: ${issue} - THIS IS AN IRON PLAY PLAN: ONLY use drills related to iron shots and approach shots.`;
            break;
          case 'short_game':
            issue = `STRICTLY SHORT GAME ONLY: ${issue} - THIS IS A SHORT GAME PLAN: ONLY use chipping and pitching drills.`;
            break;
          case 'bunker':
            issue = `STRICTLY BUNKER PLAY ONLY: ${issue} - THIS IS A BUNKER/SAND PLAN: ONLY use drills for bunker shots and sand play.`;
            break;
        }
      }
      
      // If we have a focus area from AI Analysis, prefix the issue with it
      if (focusArea && issue && !issue.includes(focusArea)) {
        issue = `Improve ${focusArea}: ${issue}`;
      }

      if (!issue) {
        toast({
          title: "Missing practice issue",
          description: "Could not determine what to focus on for your practice plan",
          variant: "destructive"
        });
        return;
      }

      const plan = await generatePlan(user?.id, issue, undefined, planDuration);
      
      toast({
        title: "Practice Plan Generated",
        description: "Your custom practice plan has been created"
      });
      
      // Navigate to My Practice Plans page after successful generation
      navigate("/my-practice-plans");
    } catch (error) {
      console.error("Error generating practice plan:", error);
      toast({
        title: "Generation Failed",
        description: "There was a problem creating your practice plan",
        variant: "destructive"
      });
    }
  };

  const goToDrillLibrary = () => {
    navigate("/drills");
  };

  if (isLoading && drillIds.length > 0) {
    return <Loading message="Loading selected drills..." />;
  }

  if (isGenerating) {
    return <Loading message={`Creating practice plan for ${focusArea || 'your golf skills'}...`} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Practice Plan Generator</h1>
        <p className="text-muted-foreground">
          {problem ? 
            `Creating a personalized practice plan to address: ${problem}` :
            "Create a personalized practice plan based on these selected drills"
          }
        </p>
        {focusArea && (
          <p className="text-lg font-medium text-primary">Focus Area: {focusArea}</p>
        )}
      </div>

      {!problem && selectedDrills.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Drills Selected</CardTitle>
            <CardDescription>
              You need to select drills to generate a practice plan
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4 pb-6">
            <Button onClick={goToDrillLibrary}>
              Go to Drill Library
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {selectedDrills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Drills</CardTitle>
                <CardDescription>
                  {selectedDrills.length} drill{selectedDrills.length !== 1 ? 's' : ''} selected for your practice plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedDrills.map(drill => (
                    <DrillCard key={drill.id} drill={drill} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {problem && (
            <Card>
              <CardHeader>
                <CardTitle>Issue to Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{problem}</p>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-between">
            {!problem && (
              <Button variant="outline" onClick={goToDrillLibrary}>
                Select Different Drills
              </Button>
            )}
            {problem && (
              <Button 
                variant="outline" 
                onClick={() => navigate("/ai-analysis")}
              >
                Back to Analysis
              </Button>
            )}
            <Button 
              onClick={generatePracticeIssue} 
              disabled={isGenerating}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {isGenerating ? "Generating Plan..." : "Generate Practice Plan"}
            </Button>
          </div>
          
          <PlanDurationDialog
            isOpen={showDurationDialog}
            onClose={() => setShowDurationDialog(false)}
            planDuration={planDuration}
            onPlanDurationChange={setPlanDuration}
            onConfirm={handleConfirmDuration}
          />
        </>
      )}
    </div>
  );
};

export default PracticePlanGenerator;
