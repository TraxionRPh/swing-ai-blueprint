
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

interface DrillCardProps {
  drill: Drill;
}

export const DrillCard = ({ drill }: DrillCardProps) => {
  // Helper function to get badge variant based on difficulty
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

  // Helper function to capitalize first letter of each word
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{drill.title}</CardTitle>
          <Badge className={getDifficultyBadgeClass(drill.difficulty)}>
            {drill.difficulty}
          </Badge>
        </div>
        <CardDescription>{drill.duration}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{drill.description}</p>
        <div className="flex flex-wrap gap-2">
          {drill.focus.map((tag: string) => (
            <Badge key={tag} variant="outline">
              {capitalizeFirstLetter(tag)}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" size="sm" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
