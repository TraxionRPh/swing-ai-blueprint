
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const EmptyPlansState = () => {
  return (
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
  );
};
