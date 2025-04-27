
import { Drill } from "@/types/drill";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, InfoIcon, MoveDown } from "lucide-react";
import { DrillCarousel } from "./DrillCarousel";
import { memo } from "react";

interface RecommendedDrillsSectionProps {
  drills: Drill[];
  searchAnalysis: string;
}

export const RecommendedDrillsSection = memo(({ 
  drills, 
  searchAnalysis 
}: RecommendedDrillsSectionProps) => {
  if (!drills.length) return null;

  // Extract key points from the analysis for better presentation
  const analysisPoints = searchAnalysis
    .split(/\n+/)
    .filter(point => point.trim().length > 0)
    .map(point => point.trim());

  return (
    <div id="recommended-drills" className="my-8 scroll-mt-16">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Recommended Drills for Your Issue</h2>
        
        {searchAnalysis && (
          <Alert className="bg-gradient-to-r from-[#9b87f5]/10 to-[#D946EF]/10 border-[#9b87f5]/20 mb-6">
            <AlertCircle className="h-5 w-5 text-[#9b87f5]" />
            <AlertTitle className="text-[#9b87f5] font-semibold text-lg mb-2">Coach's Analysis</AlertTitle>
            <AlertDescription className="text-foreground/90 leading-relaxed">
              {analysisPoints.length > 1 ? (
                <div className="space-y-2 mt-2">
                  {analysisPoints.map((point, index) => (
                    <p key={index} className="pl-6">
                      {point}
                    </p>
                  ))}
                </div>
              ) : (
                searchAnalysis
              )}
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
});

RecommendedDrillsSection.displayName = "RecommendedDrillsSection";
