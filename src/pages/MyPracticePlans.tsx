import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-native";
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
      console.log("Fetching practice plans for user:", user.id);
      
      const { data, error } = await supabase
        .from('ai_practice_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching practice plans:", error);
        throw error;
      }

      if (data) {
        console.log("Practice plans fetched:", data.length);
        const typedPlans: SavedPracticePlan[] = data.map(plan => ({
          ...plan,
          root_causes: plan.root_causes as unknown as string[],
          recommended_drills: plan.recommended_drills as unknown as any[],
          practice_plan: plan.practice_plan as unknown as GeneratedPracticePlan
        }));
        
        const filteredPlans = typedPlans.filter(plan => !deletedPlanIds.includes(plan.id));
        console.log("Filtered plans (after removing deleted):", filteredPlans.length);
        setPlans(filteredPlans);
        
        if (showLatest && filteredPlans.length > 0) {
          console.log("Auto-selecting latest plan:", filteredPlans[0].id);
          setSelectedPlan(filteredPlans[0].practice_plan);
          setSelectedPlanId(filteredPlans[0].id);
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
    
    // This ensures we reload plans when the page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadPracticePlans();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadPracticePlans]);

  const deletePracticePlan = useCallback(async (planId: string) => {
    try {
      // Optimistically update UI
      setPlans(plans.filter(plan => plan.id !== planId));
      
      if (selectedPlanId === planId) {
        setSelectedPlan(null);
        setSelectedPlanId(null);
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
  }, [plans, selectedPlanId, toast, loadPracticePlans]);

  const clearSelectedPlan = useCallback(() => {
    setSelectedPlan(null);
    setSelectedPlanId(null);
    navigate(location.pathname, { replace: true });
  }, [navigate, location.pathname]);
  
  const viewPlan = useCallback((plan: SavedPracticePlan) => {
    setSelectedPlan(plan.practice_plan);
    setSelectedPlanId(plan.id);
  }, []);

  // Memoize the plan cards to prevent unnecessary re-renders
  const planCards = useMemo(() => (
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
  ), [plans, viewPlan, deletePracticePlan]);

  return (
    <div className="container p-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Practice Plans</h1>
        <Button size="sm" variant="outline" onClick={loadPracticePlans}>
          Refresh
        </Button>
      </div>
      <p className="text-muted-foreground">Review your saved practice plans</p>

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
          ) : planCards}
        </div>
      )}
    </div>
  );
};

export default MyPracticePlans;
