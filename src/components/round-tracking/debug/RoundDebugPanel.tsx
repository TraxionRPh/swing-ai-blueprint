
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, Eye, EyeOff } from "lucide-react";

interface RoundDebugPanelProps {
  roundId?: string | null;
  currentHole?: number;
  holeCount?: number | null;
  isLoading?: boolean;
  loadingStage?: string;
  resumeData?: {
    forceResume?: string | null;
    sessionHole?: string | null;
    localHole?: string | null;
  };
}

export const RoundDebugPanel = ({
  roundId,
  currentHole,
  holeCount,
  isLoading,
  loadingStage,
  resumeData
}: RoundDebugPanelProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  // Get current resume data
  const currentResumeData = resumeData || {
    forceResume: sessionStorage.getItem('force-resume'),
    sessionHole: sessionStorage.getItem('resume-hole-number'),
    localHole: localStorage.getItem('resume-hole-number'),
  };

  const clearResumeData = () => {
    sessionStorage.removeItem('force-resume');
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    // Force a rerender to update the displayed values
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 10);
  };

  const setForceResume = () => {
    sessionStorage.setItem('force-resume', 'true');
    // If we don't have a resume hole set, set one
    if (!sessionStorage.getItem('resume-hole-number') && !localStorage.getItem('resume-hole-number')) {
      const holeToResume = currentHole && currentHole < (holeCount || 18) ? currentHole + 1 : 1;
      sessionStorage.setItem('resume-hole-number', String(holeToResume));
      localStorage.setItem('resume-hole-number', String(holeToResume));
    }
    // Force a rerender to update the displayed values
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 10);
  };

  if (!isVisible) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        className="fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100"
        onClick={() => setIsVisible(true)}
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Round Debug Panel</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => setIsVisible(false)}
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="text-xs">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Round ID:</div>
            <div className="truncate">{roundId || 'None'}</div>
            
            <div className="font-medium">Current Hole:</div>
            <div>{currentHole || 'Not set'}</div>
            
            <div className="font-medium">Hole Count:</div>
            <div>{holeCount || 'Default (18)'}</div>
            
            <div className="font-medium">Loading:</div>
            <div>{isLoading ? `Yes (${loadingStage})` : 'No'}</div>
            
            <div className="font-medium">Force Resume:</div>
            <div>{currentResumeData.forceResume || 'Not set'}</div>
            
            <div className="font-medium">Session Hole:</div>
            <div>{currentResumeData.sessionHole || 'Not set'}</div>
            
            <div className="font-medium">Local Hole:</div>
            <div>{currentResumeData.localHole || 'Not set'}</div>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button size="sm" variant="outline" onClick={clearResumeData} className="text-xs h-8">
              Clear Resume Data
            </Button>
            <Button size="sm" variant="outline" onClick={setForceResume} className="text-xs h-8">
              Set Force Resume
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
