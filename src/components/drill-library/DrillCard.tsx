
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
import { DifficultyBadge } from "./DifficultyBadge";
import { PracticeTracker } from "./PracticeTracker";

interface DrillCardProps {
  drill: Drill;
}

export const DrillCard = ({ drill }: DrillCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{drill.title}</CardTitle>
            <DifficultyBadge difficulty={drill.difficulty} />
          </div>
          <CardDescription>{drill.duration}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">
            {drill.overview?.substring(0, 150)}
            {drill.overview?.length > 150 ? '...' : ''}
          </p>
          <PracticeTracker drill={drill} />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="secondary" 
            size="sm" 
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
