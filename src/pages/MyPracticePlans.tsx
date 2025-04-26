
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { GeneratedPracticePlan, SavedPracticePlan } from "@/types/practice-plan";
import { GeneratedPlan } from "@/components/practice-plans/GeneratedPlan";
import { PlanCard } from "@/components/practice-plans/PlanCard";
import { EmptyPlansState } from "@/components/practice-plans/EmptyPlansState";
import { PlansLoadingState } from "@/components/practice-plans/PlansLoadingState";

const MyPracticePlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const showLatest = location.state?.showLatest || false;
  
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<SavedPracticePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<GeneratedPracticePlan | null>(null);

  useEffect(() => {
    loadPracticePlans();
  }, [user]);

  const loadPracticePlans = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_practice_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Properly cast the data to match our SavedPracticePlan type
        const typedPlans: SavedPracticePlan[] = data.map(plan => ({
          ...plan,
          root_causes: plan.root_causes as unknown as string[],
          recommended_drills: plan.recommended_drills as unknown as any[],
          practice_plan: plan.practice_plan as unknown as GeneratedPracticePlan
        }));
        
        setPlans(typedPlans);
        
        if (showLatest && typedPlans.length > 0) {
          setSelectedPlan(typedPlans[0].practice_plan);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load practice plans",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePracticePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('ai_practice_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        throw error;
      }

      setPlans(plans.filter(plan => plan.id !== planId));
      
      if (selectedPlan && selectedPlan.id === planId) {
        setSelectedPlan(null);
      }

      toast({
        title: "Success",
        description: "Practice plan deleted"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete practice plan",
        variant: "destructive"
      });
    }
  };

  const clearSelectedPlan = () => {
    setSelectedPlan(null);
    window.history.replaceState({}, document.title);
  };
  
  const viewPlan = (plan: SavedPracticePlan) => {
    setSelectedPlan(plan.practice_plan);
  };

  return (
    <div className="container p-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Practice Plans</h1>
        <p className="text-muted-foreground">Review your saved practice plans</p>
      </div>

      {selectedPlan ? (
        <div>
          <Button variant="outline" onClick={clearSelectedPlan} className="mb-4">
            Back to Plans
          </Button>
          <GeneratedPlan
            plan={selectedPlan}
            onClear={clearSelectedPlan}
            planDuration={selectedPlan.practicePlan?.duration?.split(" ")[0] || "1"}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {isLoading ? (
            <PlansLoadingState />
          ) : plans.length === 0 ? (
            <EmptyPlansState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onView={viewPlan}
                  onDelete={deletePracticePlan}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyPracticePlans;
