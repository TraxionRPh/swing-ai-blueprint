import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { GeneratedPracticePlan, SavedPracticePlan } from "@/types/practice-plan";
import { GeneratedPlan } from "@/components/practice-plans/GeneratedPlan";
import { PlanCard } from "@/components/practice-plans/PlanCard";
import { EmptyPlansState } from "@/components/practice-plans/EmptyPlansState";
import { PlansLoadingState } from "@/components/practice-plans/PlansLoadingState";

// Local storage key for deleted plan IDs
const DELETED_PLANS_STORAGE_KEY = "golf-app-deleted-plan-ids";

const MyPracticePlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const showLatest = location.state?.showLatest || false;
  
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<SavedPracticePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<GeneratedPracticePlan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [deletedPlanIds, setDeletedPlanIds] = useState<string[]>(() => {
    // Initialize from localStorage
    const savedIds = localStorage.getItem(DELETED_PLANS_STORAGE_KEY);
    return savedIds ? JSON.parse(savedIds) : [];
  });

  // Update localStorage whenever deletedPlanIds changes
  useEffect(() => {
    localStorage.setItem(DELETED_PLANS_STORAGE_KEY, JSON.stringify(deletedPlanIds));
  }, [deletedPlanIds]);

  const loadPracticePlans = useCallback(async () => {
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
        const typedPlans: SavedPracticePlan[] = data.map(plan => ({
          ...plan,
          root_causes: plan.root_causes as unknown as string[],
          recommended_drills: plan.recommended_drills as unknown as any[],
          practice_plan: plan.practice_plan as unknown as GeneratedPracticePlan
        }));
        
        const filteredPlans = typedPlans.filter(plan => !deletedPlanIds.includes(plan.id));
        setPlans(filteredPlans);
        
        if (showLatest && filteredPlans.length > 0) {
          setSelectedPlan(filteredPlans[0].practice_plan);
        }
      }
    } catch (error) {
      console.error("Error loading practice plans:", error);
      toast({
        title: "Error",
        description: "Failed to load practice plans",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, deletedPlanIds, showLatest, toast]);

  useEffect(() => {
    loadPracticePlans();
  }, [loadPracticePlans]);

  const deletePracticePlan = async (planId: string) => {
    try {
      // Optimistically update UI
      setPlans(plans.filter(plan => plan.id !== planId));
      
      if (selectedPlan && plans.find(p => p.id === planId)?.practice_plan.id === selectedPlan.id) {
        setSelectedPlan(null);
      }

      // Add to deleted IDs list (which will update localStorage via effect)
      setDeletedPlanIds(prev => [...prev, planId]);

      const { error } = await supabase
        .from('ai_practice_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Practice plan deleted"
      });
    } catch (error) {
      console.error("Error deleting practice plan:", error);
      
      // Roll back optimistic updates
      setDeletedPlanIds(prev => prev.filter(id => id !== planId));
      
      loadPracticePlans();
      
      toast({
        title: "Error",
        description: "Failed to delete practice plan",
        variant: "destructive"
      });
    }
  };

  const clearSelectedPlan = () => {
    setSelectedPlan(null);
    setSelectedPlanId(null);
    navigate(location.pathname, { replace: true });
  };
  
  const viewPlan = (plan: SavedPracticePlan) => {
    setSelectedPlan(plan.practice_plan);
    setSelectedPlanId(plan.id);
  };

  return (
    <div className="container p-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Practice Plans</h1>
        <p className="text-muted-foreground">Review your saved practice plans</p>
      </div>

      {selectedPlan ? (
        <GeneratedPlan
          plan={selectedPlan}
          onClear={clearSelectedPlan}
          planDuration={selectedPlan.practicePlan?.duration?.split(" ")[0] || "1"}
          planId={selectedPlanId}
        />
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
