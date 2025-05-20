
import { useNavigate, useParams, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { RoundProvider } from "@/context/round"; // Updated import path
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

  return (
    <ErrorBoundary>
      <RoundProvider>
        <Routes>
          {/* Main rounds listing page */}
          <Route path="/" element={<RoundsList onBack={handleBack} />} />
          
          {/* New round creation - with explicit hole count in URL */}
          <Route path="/new" element={<RoundCreation onBack={handleBack} />} />
          <Route path="/new/9" element={<RoundCreation onBack={handleBack} holeCount={9} />} />
          <Route path="/new/18" element={<RoundCreation onBack={handleBack} holeCount={18} />} />
          
          {/* Round detail page - add trailing wildcard to fix nested routing */}
          <Route path="/:roundId/*" element={<RoundDetail onBack={handleBack} />} />
          
          {/* Round scoring page - hole by hole */}
          <Route path="/:roundId/:holeNumber" element={<HoleScoring onBack={() => navigate(`/rounds/${useParams().roundId}`)} />} />
          
          {/* Round review page */}
          <Route path="/:roundId/review" element={<RoundReview onBack={() => navigate(`/rounds/${useParams().roundId}`)} />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/rounds" replace />} />
        </Routes>
      </RoundProvider>
    </ErrorBoundary>
  );
};

export default RoundTracking;
