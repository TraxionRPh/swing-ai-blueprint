
import { Badge } from "@/components/ui/badge";

interface CommonProblem {
  id: number;
  problem: string;
  description: string;
  popularity: string;
}

interface CommonProblemCardProps {
  item: CommonProblem;
  onSelect: (problem: string) => void;
}

export const CommonProblemCard = ({ item, onSelect }: CommonProblemCardProps) => {
  return (
    <button
      className="text-left p-3 bg-muted/50 hover:bg-muted rounded-lg border border-transparent hover:border-muted-foreground/20 transition-colors w-full"
      onClick={() => onSelect(item.problem)}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-medium">{item.problem}</h4>
        <Badge variant="outline" className="text-xs">{item.popularity}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{item.description}</p>
    </button>
  );
};
