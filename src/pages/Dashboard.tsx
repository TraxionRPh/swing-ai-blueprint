import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
} from "recharts";

const scoreData = [
  { date: 'Jan 15', score: 92 },
  { date: 'Jan 29', score: 89 },
  { date: 'Feb 12', score: 87 },
  { date: 'Feb 26', score: 90 },
  { date: 'Mar 10', score: 85 },
  { date: 'Mar 24', score: 83 },
];

const practiceFocusData = [
  { name: 'Driving', hours: 8 },
  { name: 'Iron Play', hours: 12 },
  { name: 'Chipping', hours: 5 },
  { name: 'Putting', hours: 15 },
];

const Dashboard = () => {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your golf performance.
        </p>
      </div>
      
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mt-4">
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Recent Scores</CardTitle>
            <CardDescription>Your last 6 rounds</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} reversed />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#FFC300"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Practice Focus</CardTitle>
            <CardDescription>Hours spent by category</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={practiceFocusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Scoring Breakdown</CardTitle>
            <CardDescription>Last 5 rounds performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Fairways Hit</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#10B981]">64%</span>
                  <span className="text-xs text-muted-foreground">(+2%)</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div className="h-2 bg-[#10B981] rounded-full" style={{ width: '64%' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Greens in Regulation</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#10B981]">48%</span>
                  <span className="text-xs text-muted-foreground">(+5%)</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div className="h-2 bg-[#10B981] rounded-full" style={{ width: '48%' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Putts per Round</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#FFC300]">31.4</span>
                  <span className="text-xs text-muted-foreground">(-0.6)</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div className="h-2 bg-[#FFC300] rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-transparent bg-gradient-to-r p-[1px] from-[#9b87f5] to-[#D946EF]">
          <div className="bg-card h-full rounded-lg">
            <CardHeader className="pb-2 text-foreground rounded-t-lg border-b border-purple-500/20">
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Analysis based on recent rounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="p-4 bg-muted/20 rounded-lg border border-[#10B981]/20">
                <h4 className="font-medium mb-2 text-[#10B981]">Strong Performance Areas</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Consistent improvement in fairway accuracy (+2% over last 5 rounds)</li>
                  <li>• Significant progress in GIR percentage (+5% improvement)</li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted/20 rounded-lg border border-[#FFC300]/20">
                <h4 className="font-medium mb-2 text-[#FFC300]">Areas for Focus</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Average of 1.8 three-putts per round</li>
                  <li>• Sand save percentage below target (current: 35%)</li>
                </ul>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
