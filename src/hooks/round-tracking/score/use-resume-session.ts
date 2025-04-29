
import { useEffect } from "react";

export const useResumeSession = () => {
  // Check for resume data in sessionStorage and localStorage
  useEffect(() => {
    const sessionHoleNumber = sessionStorage.getItem('resume-hole-number');
    const localHoleNumber = localStorage.getItem('resume-hole-number');
    
    if (sessionHoleNumber) {
      console.log("Found resume hole in sessionStorage:", sessionHoleNumber);
    }
    
    if (localHoleNumber) {
      console.log("Found resume hole in localStorage:", localHoleNumber);
    }
  }, []);

  // Function to clear resume data
  const clearResumeData = () => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    console.log("Cleared resume hole data");
  };

  return { clearResumeData };
};
