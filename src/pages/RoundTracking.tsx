
import { useNavigate, useParams, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { RoundProvider } from "@/context/round"; 
import { RoundsList } from "@/components/round-tracking/RoundsList";
import { RoundCreation } from "@/components/round-tracking/RoundCreation"; 
import { RoundDetail } from "@/components/round-tracking/RoundDetail";
import { HoleScoring } from "@/components/round-tracking/HoleScoring";
import { RoundReview } from "@/components/round-tracking/RoundReview";

const RoundTracking = () => {
  const navigate = useNavigate();

  // Handle navigation back to the rounds list
  const handleBack = () => {
    navigate("/rounds");
  };

  // Create a component that will render the RoundDetail with proper back navigation
  const RoundDetailWithBackNav = () => {
    return <RoundDetail onBack={handleBack} />;
  };
  
  // Create a component that will render the HoleScoring with proper back navigation
  const HoleScoringWithBackNav = () => {
    const { roundId } = useParams();
    return <HoleScoring onBack={() => navigate(`/rounds/${roundId}`)} />;
  };
  
  // Create a component that will render the RoundReview with proper back navigation
  const RoundReviewWithBackNav = () => {
    const { roundId } = useParams();
    return <RoundReview onBack={() => navigate(`/rounds/${roundId}`)} />;
  };

  return (
    <ErrorBoundary>
      <RoundProvider>
        <Routes>
          {/* Main rounds listing page */}
          <Route path="/" element={<RoundsList onBack={handleBack} />} />
          
          {/* New round creation page - separate routes for different hole counts */}
          <Route path="/new" element={<RoundCreation onBack={handleBack} />} />
          <Route path="/new/9" element={<RoundCreation onBack={handleBack} holeCount={9} />} />
          <Route path="/new/18" element={<RoundCreation onBack={handleBack} holeCount={18} />} />
          
          {/* Round detail page */}
          <Route path="/:roundId/*" element={<RoundDetailWithBackNav />} />
          
          {/* Round scoring page - hole by hole */}
          <Route path="/:roundId/:holeNumber" element={<HoleScoringWithBackNav />} />
          
          {/* Round review page */}
          <Route path="/:roundId/review" element={<RoundReviewWithBackNav />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/rounds" replace />} />
        </Routes>
      </RoundProvider>
    </ErrorBoundary>
  );
};

export default RoundTracking;
