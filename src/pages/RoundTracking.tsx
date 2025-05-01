
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { RoundTracker } from "@/components/round-tracking/RoundTracker";
import { RoundsList } from "@/components/round-tracking/RoundsList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const RoundTracking = () => {
  const navigate = useNavigate();
  
  // Clear any resume data on page load
  useEffect(() => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
  }, []);
  
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/dashboard')}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
        <h1 className="text-3xl font-bold">Round Tracking</h1>
      </div>
      
      <Routes>
        <Route path="/" element={<RoundsList />} />
        <Route path="/new" element={<CourseSelector />} />
        <Route path="/:roundId/:holeNumber" element={<RoundTracker />} />
        <Route path="/:roundId" element={<Navigate to="/rounds" replace />} />
      </Routes>
    </div>
  );
};

export default RoundTracking;
