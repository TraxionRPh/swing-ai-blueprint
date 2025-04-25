
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

// Pages
import Auth from "./pages/Auth";
import DrillLibrary from "./pages/DrillLibrary";
import ChallengeLibrary from "./pages/ChallengeLibrary";
import RoundTracking from "./pages/RoundTracking";
import Dashboard from "./pages/Dashboard";
import AIAnalysis from "./pages/AIAnalysis";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Welcome from "./pages/Welcome";

const queryClient = new QueryClient();

// Root component to handle conditional rendering based on auth state
const Root = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="p-6">
          <div className="animate-pulse">Loading...</div>
        </Card>
      </div>
    );
  }

  // Redirect to welcome if authenticated, otherwise show auth page
  return session ? <Navigate to="/welcome" replace /> : <Auth />;
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
