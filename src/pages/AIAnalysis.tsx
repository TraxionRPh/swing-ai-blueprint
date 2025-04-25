
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const perfData = [
  { area: "Driving", value: 60 },
  { area: "Iron Play", value: 45 },
  { area: "Chipping", value: 70 },
  { area: "Bunker", value: 40 },
  { area: "Putting", value: 65 },
];

const confidenceData = [
  { month: 'Jan', confidence: 35 },
  { month: 'Feb', confidence: 42 },
  { month: 'Mar', confidence: 48 },
  { month: 'Apr', confidence: 55 },
];

const AIAnalysis = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Analysis</h1>
        <p className="text-muted-foreground">
          Personalized insights and recommendations based on your performance data
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              Performance Analysis
              <Badge variant="outline">Last Updated: Today</Badge>
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your strengths and weaknesses
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={perfData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="area" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#1E5631"
                    fill="#1E5631"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confidence Score</CardTitle>
            <CardDescription>
              Your game confidence based on performance trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Current Score</p>
                  <p className="text-3xl font-bold">55</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  +7 pts from last month
                </div>
              </div>
              <Progress value={55} className="h-2" />
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="confidence"
                      stroke="#FCA311"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Identified Issues</CardTitle>
            <CardDescription>
              Areas where AI has detected opportunities for improvement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <h4 className="font-medium">Driver Path</h4>
                <Badge variant="secondary">High Priority</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Data shows a consistent out-to-in swing path with your driver, 
                leading to slices on 68% of drives.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <h4 className="font-medium">Bunker Play</h4>
                <Badge variant="secondary">Medium Priority</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Sand save percentage is 22%, well below average for your handicap range.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <h4 className="font-medium">Iron Distance Control</h4>
                <Badge variant="secondary">Medium Priority</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Your approach shots show inconsistent distance control, with 65% landing short.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="secondary">
              View Recommended Drills
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Practice Recommendations</CardTitle>
          <CardDescription>
            Personalized practice plan based on your recent performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">This Week's Focus: Driver Path Correction</h3>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Primary Drill: Alignment Stick Path</h4>
                <p className="text-sm text-muted-foreground">
                  Place alignment sticks on the ground to visualize your swing path. This will help correct
                  your out-to-in tendency and promote a more neutral or slightly in-to-out path.
                </p>
                <p className="text-sm font-medium mt-2">Recommended frequency: 3x weekly, 15 minutes each</p>
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Secondary Drill: Half-Swing Power</h4>
                <p className="text-sm text-muted-foreground">
                  Practice half swings with your driver, focusing on rotating through impact and finishing 
                  with the club face pointing at the target.
                </p>
                <p className="text-sm font-medium mt-2">Recommended frequency: 2x weekly, 20 minutes each</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Weekly Assignment</h3>
            <p className="text-sm text-muted-foreground">
              Complete the "100 Putts Challenge" this week to improve your putting stroke consistency.
              Record your results in the Challenge Library.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Download PDF Report</Button>
          <Button>Generate Full Practice Plan</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIAnalysis;
