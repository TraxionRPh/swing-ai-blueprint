
import { ActivePracticePlan } from "@/components/dashboard/ActivePracticePlan";
import { StatCards } from "@/components/dashboard/StatCards";
import { ScoreChart } from "@/components/dashboard/ScoreChart";
import { PracticeChart } from "@/components/dashboard/PracticeChart";
import { ScoringBreakdown } from "@/components/dashboard/ScoringBreakdown";
import { PerformanceInsights } from "@/components/dashboard/PerformanceInsights";

const Dashboard = () => {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your golf performance.
        </p>
      </div>
      
      <ActivePracticePlan />
      <StatCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mt-4">
        <ScoreChart />
        <PracticeChart />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <ScoringBreakdown />
        <PerformanceInsights />
      </div>
    </div>
  );
};

export default Dashboard;
