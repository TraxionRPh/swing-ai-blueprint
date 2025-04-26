
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlanTypeSelectorProps {
  planType: string;
  onChange: (value: string) => void;
}

export const PlanTypeSelector = ({ planType, onChange }: PlanTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Plan Type</h3>
      <Tabs value={planType} onValueChange={onChange} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="ai">AI-Generated</TabsTrigger>
          <TabsTrigger value="manual">Manual Selection</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {planType === "ai" && (
        <p className="text-sm text-muted-foreground">
          Our AI will analyze your performance data and create a plan tailored to your needs.
        </p>
      )}
      
      {planType === "manual" && (
        <p className="text-sm text-muted-foreground">
          Select specific drills and exercises to create your own custom practice plan.
        </p>
      )}
    </div>
  );
};
