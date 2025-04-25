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
        <Card className="bg-gradient-to-br from-green-400 to-mint-500 text-white">
          <CardHeader className="text-white">
            <CardTitle className="text-white">Handicap</CardTitle>
            <CardDescription className="text-white/80">Current handicap index</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center pt-4">
            <div className="text-5xl font-bold">18.2</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white">
          <CardHeader className="text-white">
            <CardTitle className="text-white">Best Round</CardTitle>
            <CardDescription className="text-white/80">Your lowest round in past 90 days</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center pt-4">
            <div className="text-5xl font-bold">83</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-400 to-red-500 text-white">
          <CardHeader className="text-white">
            <CardTitle className="text-white">Practice Time</CardTitle>
            <CardDescription className="text-white/80">Hours practiced this month</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center pt-4">
            <div className="text-5xl font-bold">12</div>
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
                    stroke="#10B981" 
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
                  <Bar dataKey="hours" fill="#FFC300" />
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
        
        <Card className="col-span-2 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="text-white">
            <CardTitle className="text-white">AI Insights</CardTitle>
            <CardDescription className="text-white/80">Personalized recommendations based on your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/20 rounded-lg">
              <h4 className="font-medium mb-2 text-white">Putting Improvement</h4>
              <p className="text-sm text-white/80">
                Your putting stats show you're averaging 33 putts per round. Try the "Clock Drill" 
                for distance control and the "Gate Drill" for direction accuracy.
              </p>
            </div>
            <div className="p-4 bg-white/20 rounded-lg">
              <h4 className="font-medium mb-2 text-white">Drive Consistency</h4>
              <p className="text-sm text-white/80">
                Your driving accuracy is improving but could benefit from more consistency. 
                Focus on the "Alignment Stick Path" drill to improve your swing path.
              </p>
            </div>
            <div className="text-sm text-center mt-2">
              <a href="/ai-analysis" className="text-white hover:underline">View full AI analysis →</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
