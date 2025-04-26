
import { Drill } from "@/types/drill";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, MoveDown } from "lucide-react";
import { DrillCarousel } from "./DrillCarousel";

interface RecommendedDrillsSectionProps {
  drills: Drill[];
  searchAnalysis: string;
}

export const RecommendedDrillsSection = ({ 
  drills, 
  searchAnalysis 
}: RecommendedDrillsSectionProps) => {
  if (!drills.length) return null;

  return (
    <div id="recommended-drills" className="my-8 scroll-mt-16">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Recommended Drills for Your Issue</h2>
        
        {searchAnalysis && (
          <Alert className="bg-gradient-to-r from-[#9b87f5]/10 to-[#D946EF]/10 border-[#9b87f5]/20 mb-6">
            <AlertCircle className="h-4 w-4 text-[#9b87f5]" />
            <AlertTitle className="text-[#9b87f5] font-semibold text-lg mb-2">Coach's Analysis</AlertTitle>
            <AlertDescription className="text-foreground/90 leading-relaxed">
              {searchAnalysis}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MoveDown className="h-4 w-4" />
          <p>Swipe through these personalized recommendations or create a complete practice plan</p>
        </div>
      </div>
      
      <DrillCarousel drills={drills} />
    </div>
  );
};
