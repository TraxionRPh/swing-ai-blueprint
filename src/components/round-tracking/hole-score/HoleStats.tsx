
import { Badge } from "@/components/ui/badge";

interface HoleStatsProps {
  par: number;
  score: number;
  putts: number | undefined;
}

export const HoleStats = ({
  par,
  score,
  putts
}: HoleStatsProps) => {
  // Safety checks for undefined or null values
  const safePar = par ?? 0;
  const safeScore = score ?? 0;
  const safePutts = putts;

  // Calculate the relation to par (only if we have valid values)
  const getRelationToPar = () => {
    if (!safePar || !safeScore) return "Even";
    const diff = safeScore - safePar;
    if (diff === 0) return "Even";
    if (diff > 0) return `+${diff}`;
    return diff.toString(); // Already has the minus sign
  };

  // Get color class based on relation to par
  const getScoreColorClass = () => {
    if (!safePar || !safeScore) return "bg-gray-200 text-gray-700";
    const diff = safeScore - safePar;
    if (diff === 0) return "bg-gray-200 text-gray-700"; // Even
    if (diff < 0) return "bg-green-100 text-green-800"; // Under par
    return "bg-red-100 text-red-800"; // Over par
  };

  // Get appropriate text for putts display
  const getPuttsText = () => {
    if (safePutts === 0) return "Chip-in";
    return `${safePutts} ${safePutts === 1 ? 'Putt' : 'Putts'}`;
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {safeScore > 0 && (
        <Badge variant="outline" className={getScoreColorClass()}>
          {getRelationToPar()} ({safeScore})
        </Badge>
      )}
      
      {safePutts !== undefined && (
        <Badge variant="outline" className={safePutts === 0 ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
          {getPuttsText()}
        </Badge>
      )}
    </div>
  );
};
