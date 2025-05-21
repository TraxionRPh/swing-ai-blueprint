
import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import CourseSelection from "@/components/round-tracking/CourseSelection";
import HoleTracking from "@/components/round-tracking/HoleTracking";
import RoundReview from "@/components/round-tracking/RoundReview";
import { RoundProvider } from "@/context/round";

const RoundTracking = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Course Selection landing page */}
        <Route 
          path="/" 
          element={
            <RoundProvider initialRoundId={null}>
              <CourseSelection />
            </RoundProvider>
          }
        />
        
        {/* Hole tracking page with dynamic hole number */}
        <Route 
          path="/track/:roundId/:holeNumber" 
          element={
            <RoundProvider>
              <HoleTracking />
            </RoundProvider>
          }
        />
        
        {/* Round review page */}
        <Route 
          path="/review/:roundId" 
          element={
            <RoundProvider>
              <RoundReview />
            </RoundProvider>
          }
        />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/rounds" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default RoundTracking;
