
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { RoundProvider } from "@/context/round"; 
import { RoundsList } from "@/components/round-tracking/RoundsList";
import { RoundDetail } from "@/components/round-tracking/RoundDetail";
import { HoleScoring } from "@/components/round-tracking/HoleScoring";
import { RoundReview } from "@/components/round-tracking/RoundReview";
import { CoursesListing } from "@/components/round-tracking/CoursesListing";
import { RoundCreation } from "@/components/round-tracking/RoundCreation";

const RoundTracking = () => {
  const navigate = useNavigate();

  // Handle navigation back to the rounds list
  const handleBack = () => {
    navigate("/rounds");
  };

  return (
    <ErrorBoundary>
      <RoundProvider>
        <Routes>
          {/* Main courses listing page (default landing) */}
          <Route path="/" element={<CoursesListing onBack={handleBack} />} />
          
          {/* New Round creation page */}
          <Route path="/new" element={<RoundCreation onBack={() => navigate(-1)} />} />
          
          {/* Rounds listing */}
          <Route path="/list" element={<RoundsList onBack={handleBack} />} />
          
          {/* Round detail page */}
          <Route path="/:roundId" element={<RoundDetail onBack={handleBack} />} />
          
          {/* Round scoring page - hole by hole */}
          <Route path="/:roundId/:holeNumber" element={<HoleScoring onBack={() => navigate(-1)} />} />
          
          {/* Round review page */}
          <Route path="/:roundId/review" element={<RoundReview onBack={() => navigate(-1)} />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/rounds" replace />} />
        </Routes>
      </RoundProvider>
    </ErrorBoundary>
  );
};

export default RoundTracking;
