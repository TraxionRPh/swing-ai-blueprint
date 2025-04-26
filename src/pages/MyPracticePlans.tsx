
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { GeneratedPlan } from "@/components/practice-plans/GeneratedPlan";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Clock } from "lucide-react";

const MyPracticePlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
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

      setPlans(data || []);
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
  };
  
  const viewPlan = (plan: any) => {
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
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">No Practice Plans Yet</h3>
                <p className="text-muted-foreground">
                  Your saved practice plans will appear here. Create a plan from the Practice Plan Generator.
                </p>
                <Button 
                  onClick={() => window.location.href = "/practice-plans"}
                  className="mt-4"
                >
                  Create a Practice Plan
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="line-clamp-1">{plan.problem}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })}</span>
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {plan.practice_plan?.practicePlan?.duration || "1 day"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">{plan.diagnosis}</p>
                  </CardContent>
                  <Separator />
                  <CardFooter className="pt-4 flex justify-between">
                    <Button onClick={() => viewPlan(plan)} variant="outline">View Plan</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Practice Plan</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this practice plan? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deletePracticePlan(plan.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyPracticePlans;
