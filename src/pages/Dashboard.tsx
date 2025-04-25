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
  PieChart,
  Pie,
  Cell
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

const statData = [
  { name: "FIR %", value: 54 },
  { name: "GIR %", value: 38 },
  { name: "Putts/Round", value: 33 },
];

const COLORS = ['#10B981', '#FFC300', '#EA384C'];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your golf performance.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Handicap</CardTitle>
            <CardDescription>Current handicap index</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center pt-4">
            <div className="text-5xl font-bold text-[#10B981]">18.2</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Best Round</CardTitle>
            <CardDescription>Your lowest round in past 90 days</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center pt-4">
            <div className="text-5xl font-bold text-[#10B981]">83</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Practice Time</CardTitle>
            <CardDescription>Hours practiced this month</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center pt-4">
            <div className="text-5xl font-bold text-[#FFC300]">12</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Scores</CardTitle>
            <CardDescription>Your last 6 rounds</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-80">
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
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Practice Focus</CardTitle>
            <CardDescription>Hours spent by category</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-80">
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
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Performance Stats</CardTitle>
            <CardDescription>Key metrics from recent rounds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Personalized recommendations based on your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/20 rounded-lg border border-[#EA384C]/20">
              <h4 className="font-medium mb-2 text-[#EA384C]">Putting Improvement Needed</h4>
              <p className="text-sm text-muted-foreground">
                Your putting stats show you're averaging 33 putts per round. Try the "Clock Drill" 
                for distance control and the "Gate Drill" for direction accuracy.
              </p>
            </div>
            <div className="p-4 bg-muted/20 rounded-lg border border-[#10B981]/20">
              <h4 className="font-medium mb-2 text-[#10B981]">Drive Consistency Improving</h4>
              <p className="text-sm text-muted-foreground">
                Your driving accuracy is improving but could benefit from more consistency. 
                Focus on the "Alignment Stick Path" drill to improve your swing path.
              </p>
            </div>
            <div className="text-sm text-center mt-2">
              <a href="/ai-analysis" className="text-primary hover:underline">View full AI analysis →</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
