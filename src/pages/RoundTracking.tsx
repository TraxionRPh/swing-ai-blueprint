
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import CourseSelection from "@/components/round-tracking/CourseSelection";
import HoleTracking from "@/components/round-tracking/HoleTracking";
import RoundReview from "@/components/round-tracking/RoundReview";
import { RoundProvider } from "@/context/round";
import { RoundCreation } from "@/components/round-tracking/RoundCreation";
import { RoundsList } from "@/components/round-tracking/RoundsList";
import { RoundDetail } from "@/components/round-tracking/RoundDetail";

// Route parameter extractor for hole count
const RoundCreationWrapper = () => {
  const { holeCount } = useParams();
  return (
    <RoundProvider initialRoundId="new">
      <RoundCreation 
        onBack={() => window.history.back()} 
        holeCount={holeCount ? parseInt(holeCount) : 18} 
      />
    </RoundProvider>
  );
};

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
        
        {/* Round history list page */}
        <Route 
          path="/list" 
          element={
            <RoundsList onBack={() => window.history.back()} />
          }
        />
        
        {/* Round detail page */}
        <Route 
          path="/:roundId" 
          element={
            <RoundProvider>
              <RoundDetail onBack={() => window.history.back()} />
            </RoundProvider>
          }
        />
        
        {/* New route for course details with hole count parameter */}
        <Route 
          path="/new/:holeCount?" 
          element={<RoundCreationWrapper />} 
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
