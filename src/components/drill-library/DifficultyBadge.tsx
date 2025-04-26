
import { Badge } from "@/components/ui/badge";

interface DifficultyBadgeProps {
  difficulty: string;
}

export const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps) => {
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
    <Badge className={getDifficultyBadgeClass(difficulty)}>
      {difficulty}
    </Badge>
  );
};
