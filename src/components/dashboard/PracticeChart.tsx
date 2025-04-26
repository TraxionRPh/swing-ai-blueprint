
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const practiceFocusData = [
  { name: 'Driving', hours: 8 },
  { name: 'Iron Play', hours: 12 },
  { name: 'Chipping', hours: 5 },
  { name: 'Putting', hours: 15 },
];

export const PracticeChart = () => {
  return (
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
  );
};
