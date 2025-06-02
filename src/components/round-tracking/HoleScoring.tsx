
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-native";
import { useToast } from "@/hooks/use-toast";
import { useRound } from "@/context/round"; // Updated import path
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { RoundHeader } from "./RoundHeader";
import { LoadingState } from "./LoadingState";
import { HoleData } from "@/types/round-tracking";

interface HoleScoringProps {
  onBack: () => void;
}

export const HoleScoring = ({ onBack }: HoleScoringProps) => {
  const { roundId, holeNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    currentRoundId, 
    setCurrentRoundId,
    holeScores, 
    setCurrentHoleNumber,
    holeCount,
    updateHoleScore,
    isLoading,
    saveInProgress
  } = useRound();
  
  const [currentHole, setCurrentHole] = useState<number>(1);
  const [holeData, setHoleData] = useState<HoleData>({
    holeNumber: 1,
    par: 4,
    distance: 0,
    score: 0,
    putts: 0,
    fairwayHit: false,
    greenInRegulation: false
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Initialize the component
  useEffect(() => {
    if (roundId && roundId !== 'new') {
      console.log(`HoleScoring initialized with roundId: ${roundId}`);
      setCurrentRoundId(roundId);
      
      // Store the current round ID in session storage for persistence
      try {
        sessionStorage.setItem('current-round-id', roundId);
        localStorage.setItem('current-round-id', roundId);
      } catch (error) {
        console.error('Error storing round ID:', error);
      }
    }
    
    if (holeNumber) {
      const parsedHoleNumber = parseInt(holeNumber);
      if (!isNaN(parsedHoleNumber) && parsedHoleNumber > 0) {
        console.log(`Setting current hole to ${parsedHoleNumber}`);
        setCurrentHole(parsedHoleNumber);
        setCurrentHoleNumber(parsedHoleNumber);
        
        // Also save the current hole number for resuming later
        try {
          sessionStorage.setItem('current-hole-number', parsedHoleNumber.toString());
          localStorage.setItem('current-hole-number', parsedHoleNumber.toString());
        } catch (error) {
          console.error('Error storing current hole:', error);
        }
      }
    }
  }, [roundId, holeNumber, setCurrentRoundId, setCurrentHoleNumber]);
  
  // Update hole data when hole scores or current hole changes
  useEffect(() => {
    if (holeScores.length > 0 && currentHole > 0) {
      const hole = holeScores.find(h => h.holeNumber === currentHole);
      
      if (hole) {
        console.log(`Found existing data for hole ${currentHole}:`, hole);
        setHoleData(hole);
      } else {
        // Create default data for this hole
        console.log(`No existing data for hole ${currentHole}, creating default`);
        setHoleData({
          holeNumber: currentHole,
          par: 4,
          distance: 0,
          score: 0,
          putts: 0,
          fairwayHit: false,
          greenInRegulation: false
        });
      }
    }
  }, [holeScores, currentHole]);
  
  // Handle field updates
  const handleFieldUpdate = (field: keyof HoleData, value: any) => {
    setHoleData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Save current hole and navigate to next
  const handleNext = async () => {
    // Save current hole
    const success = await handleSave();
    if (!success) return;
    
    // Navigate to next hole if not at the end
    if (currentHole < holeCount) {
      navigate(`/rounds/${roundId}/${currentHole + 1}`);
    } else {
      // At the last hole, go to review
      navigate(`/rounds/${roundId}/review`);
    }
  };
  
  // Save current hole and navigate to previous
  const handlePrevious = async () => {
    // Save current hole
    const success = await handleSave();
    if (!success) return;
    
    // Navigate to previous hole if not at the beginning
    if (currentHole > 1) {
      navigate(`/rounds/${roundId}/${currentHole - 1}`);
    }
  };
  
  // Save the current hole data
  const handleSave = async () => {
    // Reset save status
    setSaveSuccess(false);
    setSaveError(null);
    
    console.log(`Saving hole ${currentHole} data:`, holeData);
    
    try {
      const success = await updateHoleScore(holeData);
      
      if (success) {
        console.log(`Successfully saved hole ${currentHole} data`);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        return true;
      } else {
        console.error(`Failed to save hole ${currentHole} data`);
        setSaveError("Failed to save score");
        return false;
      }
    } catch (error) {
      console.error("Error saving hole data:", error);
      setSaveError("Error saving score");
      return false;
    }
  };
  
  // Go to review screen
  const handleReview = async () => {
    // Save current hole
    const success = await handleSave();
    if (!success) return;
    
    // Navigate to review screen
    navigate(`/rounds/${roundId}/review`);
  };
  
  // Calculate the relation to par
  const getRelationToPar = () => {
    const diff = holeData.score - holeData.par;
    if (diff === 0) return "Even";
    if (diff > 0) return `+${diff}`;
    return diff.toString(); // Already has the minus sign
  };

  // Get color class based on relation to par
  const getScoreColorClass = () => {
    if (!holeData.score) return "bg-gray-200 text-gray-700";
    
    const diff = holeData.score - holeData.par;
    if (diff === 0) return "bg-gray-200 text-gray-700"; // Even
    if (diff < 0) return "bg-green-100 text-green-800"; // Under par
    if (diff === 1) return "bg-yellow-100 text-yellow-800"; // Bogey
    return "bg-red-100 text-red-800"; // Over par
  };
  
  // Auto-save when user makes changes after a short delay
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      // Only auto-save if we have actual data
      if (holeData.score > 0 || holeData.putts > 0 || holeData.fairwayHit || holeData.greenInRegulation) {
        handleSave();
      }
    }, 1500); // 1.5 second delay
    
    return () => clearTimeout(saveTimer);
  }, [holeData]);
  
  if (isLoading) {
    return <LoadingState onBack={onBack} message={`Loading hole ${currentHole}...`} />;
  }
  
  // Check if this is the first or last hole
  const isFirstHole = currentHole === 1;
  const isLastHole = currentHole === holeCount;
  
  return (
    <div className="space-y-6">
      <RoundHeader
        title={`Hole ${currentHole}`}
        subtitle={`Par ${holeData.par} • ${holeData.distance > 0 ? `${holeData.distance} yards` : 'Distance not available'}`}
        onBack={onBack}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Enter Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hole info and navigation */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Hole {currentHole} of {holeCount}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getScoreColorClass()}>
                {holeData.score ? `${getRelationToPar()} (${holeData.score})` : "No score"}
              </Badge>
            </div>
          </div>
          
          {/* Score and putts input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="score" className="text-sm">Score</Label>
              <Input
                id="score"
                type="number"
                value={holeData.score || ""}
                onChange={(e) => handleFieldUpdate('score', parseInt(e.target.value) || 0)}
                min={1}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="putts" className="text-sm">Putts</Label>
              <Input
                id="putts"
                type="number"
                value={holeData.putts || ""}
                onChange={(e) => handleFieldUpdate('putts', parseInt(e.target.value) || 0)}
                min={0}
                className="mt-1"
              />
            </div>
          </div>
          
          {/* Par selector */}
          <div>
            <Label className="text-sm">Par</Label>
            <div className="flex space-x-2 mt-1">
              {[3, 4, 5].map((par) => (
                <Button
                  key={par}
                  type="button"
                  variant={holeData.par === par ? "default" : "outline"}
                  onClick={() => handleFieldUpdate('par', par)}
                  className="flex-1"
                >
                  Par {par}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Performance toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="fairway" className="text-sm">Fairway Hit</Label>
              <Switch
                id="fairway"
                checked={holeData.fairwayHit}
                onCheckedChange={(checked) => handleFieldUpdate('fairwayHit', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="gir" className="text-sm">Green in Regulation</Label>
              <Switch
                id="gir"
                checked={holeData.greenInRegulation}
                onCheckedChange={(checked) => handleFieldUpdate('greenInRegulation', checked)}
              />
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstHole || saveInProgress}
            >
              Previous
            </Button>
            <Button
              variant={isLastHole ? "secondary" : "default"}
              onClick={isLastHole ? handleReview : handleNext}
              disabled={saveInProgress}
            >
              {isLastHole ? "Review Round" : "Next"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReview}
              disabled={saveInProgress}
            >
              Review All
            </Button>
          </div>
          
          {/* Saving indicator */}
          {(saveInProgress || saveSuccess || saveError) && (
            <div className={`flex items-center justify-center p-2 mt-4 rounded-md transition-all duration-300 animate-in fade-in ${
              saveInProgress ? "bg-amber-50 text-amber-700" : 
              saveError ? "bg-red-50 text-red-700" : 
              "bg-green-50 text-green-700"
            }`}>
              {saveInProgress && (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2 text-amber-600" />
                  <span className="text-sm">Saving your score...</span>
                </>
              )}
              
              {saveError && (
                <>
                  <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                  <span className="text-sm">{saveError}</span>
                </>
              )}
              
              {saveSuccess && !saveInProgress && !saveError && (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm">Score saved successfully</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
