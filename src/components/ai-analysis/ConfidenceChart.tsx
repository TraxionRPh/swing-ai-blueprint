import { ConfidencePoint } from "@/types/drill";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ConfidenceChartProps {
  confidenceData: ConfidencePoint[];
  currentConfidence: number;
}

export const ConfidenceChart = ({ confidenceData, currentConfidence }: ConfidenceChartProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-2">AI Confidence Over Time</h3>
      <p className="text-sm text-gray-500 mb-4">Current Confidence: {currentConfidence}%</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={confidenceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="confidence" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
