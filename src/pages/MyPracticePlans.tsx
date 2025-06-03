// MyPracticePlans.native.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigate, useLocation } from "react-router-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import type { GeneratedPracticePlan, SavedPracticePlan } from "@/types/practice-plan";
import { GeneratedPlan } from "@/components/practice-plans/GeneratedPlan";
import { PlanCard } from "@/components/practice-plans/PlanCard";
import { EmptyPlansState } from "@/components/practice-plans/EmptyPlansState";
import { PlansLoadingState } from "@/components/practice-plans/PlansLoadingState";
import { useAuth } from "@/context/AuthContext";

const DELETED_PLANS_STORAGE_KEY = "golf-app-deleted-plan-ids";

export const MyPracticePlans: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation<{ showLatest?: boolean }>();
  const navigate = useNavigate();
  const showLatest = location.state?.showLatest || false;

  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<SavedPracticePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<GeneratedPracticePlan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [deletedPlanIds, setDeletedPlanIds] = useState<string[]>([]);

  // Load deletedPlanIds from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(DELETED_PLANS_STORAGE_KEY);
        if (saved) {
          setDeletedPlanIds(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Persist deletedPlanIds to AsyncStorage whenever it changes
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(
          DELETED_PLANS_STORAGE_KEY,
          JSON.stringify(deletedPlanIds)
        );
      } catch {
        // ignore
      }
    })();
  }, [deletedPlanIds]);

  const loadPracticePlans = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_practice_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        const typedPlans: SavedPracticePlan[] = data.map((plan) => ({
          ...plan,
          root_causes: plan.root_causes as unknown as string[],
          recommended_drills: plan.recommended_drills as unknown as any[],
          practice_plan: plan.practice_plan as unknown as GeneratedPracticePlan,
        }));

        const filtered = typedPlans.filter((p) => !deletedPlanIds.includes(p.id));
        setPlans(filtered);

        if (showLatest && filtered.length > 0) {
          setSelectedPlan(filtered[0].practice_plan);
          setSelectedPlanId(filtered[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading practice plans:", error);
      toast({
        title: "Error",
        description: "Failed to load practice plans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, deletedPlanIds, showLatest, toast]);

  // Load plans on mount
  useEffect(() => {
    loadPracticePlans();
  }, [loadPracticePlans]);

  const deletePracticePlan = useCallback(
    async (planId: string) => {
      try {
        // Optimistic UI update
        setPlans((prev) => prev.filter((p) => p.id !== planId));
        if (selectedPlanId === planId) {
          setSelectedPlan(null);
          setSelectedPlanId(null);
        }
        setDeletedPlanIds((prev) => [...prev, planId]);

        const { error } = await supabase
          .from("ai_practice_plans")
          .delete()
          .eq("id", planId);
        if (error) throw error;

        toast({
          title: "Success",
          description: "Practice plan deleted",
        });
      } catch (error) {
        console.error("Error deleting practice plan:", error);
        // Rollback
        setDeletedPlanIds((prev) => prev.filter((id) => id !== planId));
        loadPracticePlans();
        toast({
          title: "Error",
          description: "Failed to delete practice plan",
          variant: "destructive",
        });
      }
    },
    [selectedPlanId, toast, loadPracticePlans]
  );

  const clearSelectedPlan = useCallback(() => {
    setSelectedPlan(null);
    setSelectedPlanId(null);
    navigate(location.pathname, { replace: true });
  }, [navigate, location.pathname]);

  const viewPlan = useCallback((plan: SavedPracticePlan) => {
    setSelectedPlan(plan.practice_plan);
    setSelectedPlanId(plan.id);
  }, []);

  const planCards = useMemo(() => {
    if (!plans) return null;
    return (
      <View style={styles.cardsGrid}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onView={viewPlan}
            onDelete={deletePracticePlan}
          />
        ))}
      </View>
    );
  }, [plans, viewPlan, deletePracticePlan]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>My Practice Plans</Text>
        <Button style={styles.refreshButton} onPress={loadPracticePlans}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Button>
      </View>
      <Text style={styles.subheading}>Review your saved practice plans</Text>

      {selectedPlan ? (
        <GeneratedPlan
          plan={selectedPlan}
          onClear={clearSelectedPlan}
          planDuration={
            selectedPlan.practicePlan?.duration?.split(" ")[0] || "1"
          }
          planId={selectedPlanId!}
        />
      ) : (
        <View style={styles.contentArea}>
          {isLoading ? (
            <PlansLoadingState />
          ) : plans.length === 0 ? (
            <EmptyPlansState />
          ) : (
            planCards
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default MyPracticePlans;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
  },
  refreshButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  refreshText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
  },
  subheading: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  contentArea: {
    flex: 1,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
