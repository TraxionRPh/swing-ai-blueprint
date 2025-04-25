
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Performance Stats</CardTitle>
            <CardDescription>Key metrics from recent rounds</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={45}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name }) => `${name}`}
                >
                  {statData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 border border-transparent bg-gradient-to-r p-[1px] from-[#9b87f5] to-[#D946EF]">
          <div className="bg-card h-full rounded-lg">
            <CardHeader className="pb-2 bg-gradient-to-r from-[#9b87f5] to-[#D946EF] text-white rounded-t-lg">
              <CardTitle>AI Insights</CardTitle>
              <CardDescription className="text-white/90">Personalized recommendations based on your data</CardDescription>
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
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
