
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Loading } from "@/components/ui/loading";
import Auth from "@/pages/Auth";
import Welcome from "@/pages/Welcome";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import DrillLibrary from "@/pages/DrillLibrary";
import ChallengeLibrary from "@/pages/ChallengeLibrary";
import RoundTracking from "@/pages/RoundTracking";
import AIAnalysis from "@/pages/AIAnalysis";
import PracticePlanGenerator from "@/pages/PracticePlanGenerator";
import AIPracticePlans from "@/pages/AIPracticePlans";
import Subscription from "@/pages/Subscription";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";

const queryClient = new QueryClient();

const Root = () => {
  const { session, loading: authLoading } = useAuth();
  const { isFirstVisit, loading: profileLoading } = useProfile();
  
  if (authLoading) {
    return (
      <div className="container mx-auto p-4">
        <Loading message="Checking authentication..." />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto p-4">
        <Loading message="Setting up your account..." />
      </div>
    );
  }

  if (isFirstVisit) {
    return <Navigate to="/welcome" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Root />} />
              <Route
                path="/welcome"
                element={
                  <ProtectedRoute>
                    <Welcome />
                  </ProtectedRoute>
                }
              />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/drills" element={<DrillLibrary />} />
                <Route path="/challenges" element={<ChallengeLibrary />} />
                <Route path="/rounds" element={<RoundTracking />} />
                <Route path="/rounds/:roundId" element={<RoundTracking />} />
                <Route path="/rounds/:roundId/:holeNumber" element={<RoundTracking />} />
                <Route path="/ai-analysis" element={<AIAnalysis />} />
                <Route path="/practice-plan-generator" element={<PracticePlanGenerator />} />
                <Route path="/practice-plans" element={<AIPracticePlans />} />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <Subscription />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
