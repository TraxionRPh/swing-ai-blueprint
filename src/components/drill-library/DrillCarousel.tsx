
import { Drill } from "@/types/drill";
import { DrillCard } from "./DrillCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

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
          <h3 className="text-lg font-semibold">Perfect Drills for Your Issue</h3>
          <p className="text-sm text-muted-foreground">
            These drills specifically address your problem - swipe through them or create a complete practice plan
          </p>
        </div>
        <Carousel className="w-full max-w-md mx-auto mb-6">
          <CarouselContent>
            {drills.map((drill) => (
              <CarouselItem key={drill.id} className="pl-4">
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
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            Create Practice Plan with These Drills
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
