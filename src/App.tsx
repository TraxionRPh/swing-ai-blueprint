
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
        path: "/",
        element: <Dashboard />,
      },
    ],
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
  },
  {
    path: "/challenges",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <ChallengeLibrary />,
      },
    ],
  },
  {
    path: "/drills",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <DrillLibrary />,
      },
    ],
  },
  {
    path: "/challenge-tracking/:challengeId",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <ChallengeTracking />,
      },
    ],
  },
  {
    path: "/challenge-history/:challengeId",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <ChallengeHistory />,
      },
    ],
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
