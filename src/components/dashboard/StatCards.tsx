
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGolfStats } from "@/hooks/useGolfStats";
import { Skeleton } from "@/components/ui/skeleton";

export const StatCards = () => {
  const { handicap, bestRound, practiceTime, loading } = useGolfStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Handicap</CardTitle>
          <CardDescription>Current handicap index</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-[#10B981]">
            {handicap?.toFixed(1) || 'N/A'}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Best Round</CardTitle>
          <CardDescription>Your lowest 18-hole round in past 90 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-[#10B981]">
            {bestRound || 'N/A'}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Practice Time</CardTitle>
          <CardDescription>Hours practiced this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            {practiceTime}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
