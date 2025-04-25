
import { Drill } from "@/components/drill-library/DrillCard";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { DrillCard } from "./DrillCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DrillCarouselProps {
  drills: Drill[];
}

export const DrillCarousel = ({ drills }: DrillCarouselProps) => {
  const navigate = useNavigate();

  const handleCreatePracticePlan = () => {
    // Store selected drills in URL params
    const drillIds = drills.map(drill => drill.id).join(',');
    navigate(`/practice-plan-generator?drills=${drillIds}`);
  };

  if (!drills.length) return null;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Recommended Drills</h3>
          <p className="text-sm text-muted-foreground">
            Swipe through these drills to improve your game
          </p>
        </div>
        <Carousel className="w-full max-w-xs mx-auto">
          <CarouselContent>
            {drills.map((drill) => (
              <CarouselItem key={drill.id}>
                <DrillCard drill={drill} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="mt-6">
          <Button 
            onClick={handleCreatePracticePlan} 
            className="w-full"
          >
            Create Practice Plan with These Drills
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
