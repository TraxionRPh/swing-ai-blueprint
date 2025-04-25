
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

// Pages
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import DrillLibrary from "./pages/DrillLibrary";
import ChallengeLibrary from "./pages/ChallengeLibrary";
import PracticePlanGenerator from "./pages/PracticePlanGenerator";
import RoundTracking from "./pages/RoundTracking";
import Dashboard from "./pages/Dashboard";
import AIAnalysis from "./pages/AIAnalysis";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route element={<Layout />}>
              <Route path="/drills" element={<DrillLibrary />} />
              <Route path="/challenges" element={<ChallengeLibrary />} />
              <Route path="/practice-plans" element={<PracticePlanGenerator />} />
              <Route path="/rounds" element={<RoundTracking />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai-analysis" element={<AIAnalysis />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
