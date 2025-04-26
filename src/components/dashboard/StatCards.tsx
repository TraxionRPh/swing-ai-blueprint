
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const StatCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Handicap</CardTitle>
          <CardDescription>Current handicap index</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-[#10B981]">18.2</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Best Round</CardTitle>
          <CardDescription>Your lowest round in past 90 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-[#10B981]">83</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Practice Time</CardTitle>
          <CardDescription>Hours practiced this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-[#FFC300]">12</div>
        </CardContent>
      </Card>
    </div>
  );
};
