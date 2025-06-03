import React from "react";
import { View, Text, ScrollView } from "react-native";
import { ActivePracticePlan } from "@/components/dashboard/ActivePracticePlan";
import { StatCards } from "@/components/dashboard/StatCards";
import { ScoreChart } from "@/components/dashboard/ScoreChart";
import { PracticeChart } from "@/components/dashboard/PracticeChart";
import { ScoringBreakdown } from "@/components/dashboard/ScoringBreakdown";
import { PerformanceInsights } from "@/components/dashboard/PerformanceInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Lock } from "lucide-react";
import { Link } from "react-router-native";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/Breadcrumb";

const Dashboard = () => {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 16,
      }}
    >
      {/* Breadcrumb Row */}
      <View className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title */}
        <Text className="text-3xl font-bold tracking-tight text-primary">
          Dashboard
        </Text>

        {/* Subtitle */}
        <Text className="text-muted-foreground mt-1">
          Welcome back! Here’s an overview of your golf performance.
        </Text>
      </View>

      {/* Active Practice Plan */}
      <View className="mb-4">
        <ActivePracticePlan />
      </View>

      {/* Stat Cards */}
      <View className="mb-4">
        <StatCards />
      </View>

      {/* Charts Grid: 2 columns on wider screens, 1 column on narrow */}
      <View className="flex-1 flex-row flex-wrap justify-between">
        <View className="w-full md:w-[48%] mb-4">
          <ScoreChart />
        </View>
        <View className="w-full md:w-[48%] mb-4">
          <PracticeChart />
        </View>
      </View>

      {/* More Cards / Charts */}
      <View className="flex-row flex-wrap justify-between">
        <View className="w-full md:w-[48%] mb-4">
          <ScoringBreakdown />
        </View>
        <View className="w-full md:w-[48%] mb-4">
          <PerformanceInsights />
        </View>
      </View>
    </ScrollView>
  );
};

export default Dashboard;
