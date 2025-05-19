
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

  // Function to determine if drills focus on putting - ENHANCED
  const isPuttingRelated = useCallback((drill: Drill) => {
    if (!drill) return false;
    
    // Direct category check - strongest indicator
    if (drill.category?.toLowerCase() === 'putting') {
      return true;
    }
    
    // Check title - strong indicator
    if (drill.title?.toLowerCase().includes('putt') || 
        drill.title?.toLowerCase().includes('green') ||
        drill.title?.toLowerCase().includes('lag') ||
        drill.title?.toLowerCase().includes('hole')) {
      return true;
    }
    
    // Check focus areas - good indicators
    if (Array.isArray(drill.focus) && drill.focus.some(f => 
      f.toLowerCase().includes('putt') || 
      f.toLowerCase().includes('green') ||
      f.toLowerCase().includes('stroke')
    )) {
      return true;
    }
    
    // Count putting-related terms across all drill texts
    const drillText = [
      drill.title?.toLowerCase() || '',
      drill.overview?.toLowerCase() || '',
      drill.category?.toLowerCase() || '',
      ...(Array.isArray(drill.focus) ? drill.focus.map(f => f.toLowerCase()) : [])
    ].join(' ');
    
    const puttingTerms = ['putt', 'green', 'hole', 'cup', 'lag', 'roll', 'stroke', 'line', 'speed'];
    let puttingTermCount = 0;
    
    for (const term of puttingTerms) {
      if (drillText.includes(term)) {
        puttingTermCount++;
      }
    }
    
    // Check for non-putting terms that suggest this is NOT a putting drill
    if (puttingTermCount >= 2) {
      const nonPuttingTerms = ['chip', 'iron', 'driver', 'bunker', 'sand', 'wedge', 'full swing', 'tee'];
      let nonPuttingCount = 0;
      
      for (const term of nonPuttingTerms) {
        if (drillText.includes(term)) {
          nonPuttingCount++;
        }
      }
      
      // If there are more non-putting terms than putting terms, this is likely not a putting drill
      if (nonPuttingCount >= puttingTermCount) {
        return false;
      }
      
      return true;
    }
    
    return false;
  }, []);

  const generatePracticeIssue = () => {
    if (selectedDrills.length === 0) {
      toast({
        title: "No drills selected",
        description: "Please select at least one drill for your practice plan",
        variant: "destructive"
      });
      return;
    }

    setShowDurationDialog(true);
  };

  const handleConfirmDuration = async () => {
    setShowDurationDialog(false);
    
    try {
      // Extract key information from the selected drills to build an issue description
      const focus = selectedDrills.flatMap(d => d.focus || []);
      const categories = [...new Set(selectedDrills.map(d => d.category))];
      
      // Check if this is primarily a putting-focused plan
      const isPuttingFocused = selectedDrills.some(isPuttingRelated) || 
                               categories.some(c => c?.toLowerCase() === 'putting');
      
      // Generate an issue based on the selected drills, ensuring category clarity
      let issue = `Create a practice plan focusing on ${focus.slice(0, 3).join(', ')} using drills for ${categories.join(' and ')}. Include drills: ${selectedDrills.map(d => d.title).join(', ')}`;
      
      // Add explicit putting instruction if putting-focused - ENHANCED
      if (isPuttingFocused) {
        issue = `PUTTING PRACTICE PLAN: ${issue} This is SPECIFICALLY a putting practice plan - ONLY include putting-related drills. No iron drills, no chipping drills, ONLY PUTTING drills.`;
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

  if (isLoading) {
    return <Loading message="Loading selected drills..." />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Practice Plan Generator</h1>
        <p className="text-muted-foreground">
          Create a personalized practice plan based on these selected drills
        </p>
      </div>

      {selectedDrills.length === 0 ? (
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
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={goToDrillLibrary}>
              Select Different Drills
            </Button>
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
