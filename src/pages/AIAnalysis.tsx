import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Analysis</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Personalized insights and recommendations based on your performance data
        </p>
      </div>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-xl">Performance Analysis</CardTitle>
              <Badge variant="outline" className="w-fit">Last Updated: Today</Badge>
            </div>
            <CardDescription>
              AI-powered analysis of your strengths and weaknesses
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="h-[300px] md:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "65%" : "80%"}>
                  <PolarGrid stroke="#666" />
                  <PolarAngleAxis
                    dataKey="area"
                    tick={{ fill: '#888', fontSize: isMobile ? 10 : 12 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#888', fontSize: isMobile ? 10 : 12 }}
                  />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    data={perfData}
                    stroke="#1E5631"
                    fill="#1E5631"
                    fillOpacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(24, 24, 27, 0.9)',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      fontSize: isMobile ? '12px' : '14px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Confidence Score</CardTitle>
              <CardDescription>
                Your game confidence based on performance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Current Score</p>
                    <p className="text-2xl md:text-3xl font-bold">55</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    +7 pts from last month
                  </div>
                </div>
                <Progress value={55} className="h-2" />
                <div className="h-[200px] md:h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={confidenceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: '#888', fontSize: isMobile ? 10 : 12 }}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: '#888', fontSize: isMobile ? 10 : 12 }}
                        width={35}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(24, 24, 27, 0.9)',
                          border: '1px solid #333',
                          borderRadius: '8px',
                          fontSize: isMobile ? '12px' : '14px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence"
                        stroke="#FCA311"
                        strokeWidth={2}
                        dot={{ r: isMobile ? 3 : 4 }}
                        activeDot={{ r: isMobile ? 6 : 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Identified Issues</CardTitle>
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
            <CardTitle className="text-lg md:text-xl">AI Practice Recommendations</CardTitle>
            <CardDescription>
              Personalized practice plan based on your recent performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto">Download PDF Report</Button>
            <Button className="w-full sm:w-auto">Generate Full Practice Plan</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AIAnalysis;
