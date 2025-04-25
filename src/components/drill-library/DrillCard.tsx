
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
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{drill.title}</CardTitle>
          <Badge variant={
            drill.difficulty === "Beginner" ? "outline" : 
            drill.difficulty === "Intermediate" ? "secondary" : "default"
          }>
            {drill.difficulty}
          </Badge>
        </div>
        <CardDescription>{drill.duration}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{drill.description}</p>
        <div className="flex flex-wrap gap-2">
          {drill.focus.map((tag: string) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
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
