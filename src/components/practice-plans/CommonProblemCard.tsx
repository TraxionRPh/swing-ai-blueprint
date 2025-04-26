
import { Badge } from "@/components/ui/badge";
import { CommonProblem } from "@/types/practice-plan";

interface CommonProblemCardProps {
  item: CommonProblem;
  onSelect: (problem: string) => void;
}

export const CommonProblemCard = ({ item, onSelect }: CommonProblemCardProps) => {
  // Convert popularity values to display text
  const getPopularityText = (popularity: string) => {
    switch (popularity.toLowerCase()) {
      case "high":
        return "Very Common";
      case "medium":
        return "Common";
      case "low":
        return "Occasional";
      default:
        return popularity;
    }
  };

  return (
    <button
      className="text-left p-3 bg-muted/50 hover:bg-muted rounded-lg border border-transparent hover:border-muted-foreground/20 transition-colors w-full"
      onClick={() => onSelect(item.problem)}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-medium line-clamp-1">{item.problem}</h4>
        <Badge variant="outline" className="text-xs text-nowrap">{getPopularityText(item.popularity)}</Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
    </button>
  );
};
