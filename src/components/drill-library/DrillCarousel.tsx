
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
        <Carousel className="w-full mx-auto mb-6">
          <CarouselContent>
            {drills.map((drill) => (
              <CarouselItem key={drill.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <DrillCard drill={drill} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2">
              <CarouselPrevious className="relative static transform-none" />
              <CarouselNext className="relative static transform-none" />
            </div>
          </div>
        </Carousel>
        <div className="mt-6">
          <Button 
            onClick={handleCreatePracticePlan} 
            className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            Create Practice Plan with These Drills
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
