
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import CourseSelection from "@/components/round-tracking/CourseSelection";
import HoleTracking from "@/components/round-tracking/HoleTracking";
import RoundReview from "@/components/round-tracking/RoundReview";
import { RoundProvider } from "@/context/round";
import { RoundCreation } from "@/components/round-tracking/RoundCreation";
import { useState } from "react";
import { AchievedGoal } from "@/hooks/useGoalAchievement";

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
  const [achievedGoal, setAchievedGoal] = useState<AchievedGoal>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  
  // Handle completed round with goal achievement
  const handleRoundComplete = (goal: AchievedGoal) => {
    if (goal) {
      console.log("Round completed with goal achievement:", goal);
      setAchievedGoal(goal);
      setShowAchievementModal(true);
    }
  };
  
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
              <RoundReview 
                onGoalAchieved={handleRoundComplete}
              />
            </RoundProvider>
          }
        />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/rounds" replace />} />
      </Routes>
      
      {/* Achievement modal that will appear after navigation */}
      {achievedGoal && (
        <AchievementModal
          achievedGoal={achievedGoal}
          showModal={showAchievementModal}
          onClose={() => {
            setShowAchievementModal(false);
            setAchievedGoal(null);
          }}
          onSetNewGoal={() => {
            setShowAchievementModal(false);
            setAchievedGoal(null);
            navigate('/profile');
          }}
        />
      )}
    </ErrorBoundary>
  );
};

export default RoundTracking;
