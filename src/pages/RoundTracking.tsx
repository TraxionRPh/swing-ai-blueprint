
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import CourseSelection from "@/components/round-tracking/CourseSelection";
import HoleTracking from "@/components/round-tracking/HoleTracking";
import RoundReview from "@/components/round-tracking/RoundReview";
import { RoundProvider } from "@/context/round";

const RoundTracking = () => {
  return (
    <ErrorBoundary>
      <RoundProvider>
        <Routes>
          {/* Course Selection landing page */}
          <Route path="/" element={<CourseSelection />} />
          
          {/* Hole tracking page with dynamic hole number */}
          <Route path="/track/:roundId/:holeNumber" element={<HoleTracking />} />
          
          {/* Round review page */}
          <Route path="/review/:roundId" element={<RoundReview />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/rounds" replace />} />
        </Routes>
      </RoundProvider>
    </ErrorBoundary>
  );
};

export default RoundTracking;
