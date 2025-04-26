
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Drill } from "@/types/drill";

interface RecommendedDrillsCardProps {
  drills: Drill[];
}

export const RecommendedDrillsCard = ({ drills }: RecommendedDrillsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Drills</CardTitle>
        <CardDescription>
          Practice these drills to address your specific issue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {drills.map((drill, i) => (
          <div key={i} className="p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{drill.title}</h4>
              <Badge>{drill.difficulty}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{drill.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex gap-2 flex-wrap">
                {drill.focus?.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{drill.duration}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
