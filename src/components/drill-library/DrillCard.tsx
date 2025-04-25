
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Drill } from "@/types/drill";
import { useState } from "react";
import { DrillDetailsModal } from "./DrillDetailsModal";

interface DrillCardProps {
  drill: Drill;
}

export const DrillCard = ({ drill }: DrillCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-500 hover:bg-emerald-600 text-white border-0";
      case "Intermediate":
        return "bg-amber-500 hover:bg-amber-600 text-white border-0";
      case "Advanced":
        return "bg-rose-500 hover:bg-rose-600 text-white border-0";
      default:
        return "bg-slate-500 hover:bg-slate-600 text-white border-0";
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{drill.title}</CardTitle>
            <Badge className={getDifficultyBadgeClass(drill.difficulty)}>
              {drill.difficulty}
            </Badge>
          </div>
          <CardDescription>{drill.duration}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">
            {drill.overview?.substring(0, 150)}
            {drill.overview?.length > 150 ? '...' : ''}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={() => setShowDetails(true)}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
      
      <DrillDetailsModal
        drill={drill}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};
