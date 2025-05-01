
import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { RoundTracker } from "@/components/round-tracking/RoundTracker";
import { RoundsList } from "@/components/round-tracking/RoundsList";
import { RoundTrackingMain } from "@/components/round-tracking/RoundTrackingMain";

const RoundTracking = () => {
  // Clear any resume data on page load
  useEffect(() => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
  }, []);
  
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Routes>
        <Route path="/" element={<RoundTrackingMain onBack={() => {}} />} />
        <Route path="/new" element={<CourseSelector />} />
        <Route path="/:roundId/:holeNumber" element={<RoundTracker />} />
        <Route path="/:roundId" element={<Navigate to="/rounds" replace />} />
      </Routes>
    </div>
  );
};

export default RoundTracking;
