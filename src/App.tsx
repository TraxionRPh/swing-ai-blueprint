
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { Loading } from "@/components/ui/loading";

// Import all page components
import Auth from "@/pages/Auth";
import Welcome from "@/pages/Welcome";
import Dashboard from "@/pages/Dashboard";
import DrillLibrary from "@/pages/DrillLibrary";
import ChallengeLibrary from "@/pages/ChallengeLibrary";
import RoundTracking from "@/pages/RoundTracking";
import AIAnalysis from "@/pages/AIAnalysis";
import NotFound from "@/pages/NotFound";
import Layout from "@/components/Layout";

const queryClient = new QueryClient();

const Root = () => {
  const { session, loading: authLoading } = useAuth();
  const { isFirstVisit, loading: profileLoading } = useProfile();
  
  if (authLoading || profileLoading) {
    return (
      <div className="container mx-auto p-4">
        <Loading message="Setting up your account..." />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (isFirstVisit) {
    return <Navigate to="/welcome" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
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
                <Route path="/ai-analysis" element={<AIAnalysis />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
