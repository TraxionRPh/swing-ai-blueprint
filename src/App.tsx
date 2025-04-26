
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import RoundTracking from "./pages/RoundTracking";
import ChallengeLibrary from "./pages/ChallengeLibrary";
import DrillLibrary from "./pages/DrillLibrary";
import ChallengeTracking from "./pages/ChallengeTracking";
import ChallengeHistory from "./pages/ChallengeHistory";
import AIPracticePlans from "./pages/AIPracticePlans";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client for React Query
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "practice-plans",
        element: <AIPracticePlans />,
      },
      {
        path: "challenges",
        element: <ChallengeLibrary />,
      },
      {
        path: "drills",
        element: <DrillLibrary />,
      },
      {
        path: "challenge-tracking/:challengeId",
        element: <ChallengeTracking />,
      },
      {
        path: "challenge-history/:challengeId",
        element: <ChallengeHistory />,
      },
    ],
    errorElement: <NotFound />,
  },
  {
    path: "/rounds/:roundId",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <RoundTracking />,
      },
    ],
    errorElement: <NotFound />,
  },
  {
    path: "/auth",
    element: <Auth />,
    errorElement: <NotFound />,
  },
  {
    path: "*",
    element: <NotFound />,
  }
]);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
