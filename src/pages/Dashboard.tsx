
import { ActivePracticePlan } from "@/components/dashboard/ActivePracticePlan";
import { StatCards } from "@/components/dashboard/StatCards";
import { ScoreChart } from "@/components/dashboard/ScoreChart";
import { PracticeChart } from "@/components/dashboard/PracticeChart";
import { ScoringBreakdown } from "@/components/dashboard/ScoringBreakdown";
import { PerformanceInsights } from "@/components/dashboard/PerformanceInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";

const Dashboard = () => {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
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
