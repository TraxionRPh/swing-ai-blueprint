
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoundTracking } from '@/hooks/useRoundTracking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, Target, Flag } from 'lucide-react';
import { HoleData } from '@/types/round-tracking';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ScoreInput } from './ScoreInput';

export const RoundTracker = () => {
  const { roundId, holeNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    status,
    round,
    currentHole,
    holeScores,
    currentHoleData,
    error,
    updateHoleScore,
    saveHoleScore,
    nextHole,
    previousHole,
    finishRound
  } = useRoundTracking(roundId || null);
  
  const [localHoleData, setLocalHoleData] = useState<HoleData | null>(null);
  
  // Initialize local hole data when currentHoleData changes
  useEffect(() => {
    if (currentHoleData) {
      setLocalHoleData(currentHoleData);
    }
  }, [currentHoleData]);
  
  // Navigate to the correct hole if the URL parameter changes
  useEffect(() => {
    if (holeNumber && round) {
      const holeNum = parseInt(holeNumber);
      if (!isNaN(holeNum) && holeNum > 0 && holeNum <= (round.hole_count || 18)) {
        // URL already matches the current state, no navigation needed
      }
    }
  }, [holeNumber, round]);
  
  if (status === 'loading') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-8 w-1/4" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className="space-y-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-destructive">Error Loading Round</h3>
              <p className="text-muted-foreground">{error || 'Could not load round data'}</p>
              <Button 
                onClick={() => navigate('/rounds')} 
                variant="outline" 
                className="mt-2"
              >
                Return to Rounds
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!round || !localHoleData) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Round Not Found</h3>
              <p className="text-muted-foreground">Could not find the requested round</p>
              <Button 
                onClick={() => navigate('/rounds')} 
                variant="outline" 
                className="mt-2"
              >
                Return to Rounds
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleScoreChange = (field: keyof HoleData, value: any) => {
    if (!localHoleData) return;
    
    const updatedData = { ...localHoleData, [field]: value };
    setLocalHoleData(updatedData);
    updateHoleScore(updatedData);
  };
  
  const handleSave = async () => {
    if (!localHoleData) return;
    
    const saved = await saveHoleScore(localHoleData);
    if (saved) {
      toast({
        title: "Score saved",
        description: `Hole ${localHoleData.holeNumber} score saved successfully`
      });
    }
  };
  
  const handleFinishRound = async () => {
    // Ask for confirmation
    if (!window.confirm('Are you sure you want to finish this round?')) {
      return;
    }
    
    // Save current hole first
    if (localHoleData) {
      await saveHoleScore(localHoleData);
    }
    
    // Finish the round
    await finishRound();
  };
  
  const courseName = round.course?.name || 'Golf Course';
  const isFirstHole = currentHole === 1;
  const isLastHole = currentHole === (round.hole_count || 18);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{courseName}</h2>
        <div className="text-sm text-muted-foreground">
          Hole {currentHole} of {round.hole_count || 18}
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-xl font-semibold">Hole {localHoleData.holeNumber}</div>
              <div className="flex space-x-2">
                {localHoleData.par > 0 && (
                  <div className="px-3 py-1 bg-muted rounded-full text-sm">
                    Par {localHoleData.par}
                  </div>
                )}
                {localHoleData.distance > 0 && (
                  <div className="px-3 py-1 bg-muted rounded-full text-sm">
                    {localHoleData.distance} yards
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <ScoreInput 
                label="Score"
                value={localHoleData.score}
                onChange={(value) => handleScoreChange('score', value)}
                icon={<Flag className="h-4 w-4" />}
                min={0}
                max={20}
              />
              
              <ScoreInput 
                label="Putts"
                value={localHoleData.putts}
                onChange={(value) => handleScoreChange('putts', value)}
                icon={<Target className="h-4 w-4" />}
                min={0}
                max={10}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="fairwayHit"
                  checked={localHoleData.fairwayHit}
                  onChange={(e) => handleScoreChange('fairwayHit', e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="fairwayHit" className="text-sm font-medium">
                  Fairway Hit
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="girHit"
                  checked={localHoleData.greenInRegulation}
                  onChange={(e) => handleScoreChange('greenInRegulation', e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="girHit" className="text-sm font-medium">
                  Green in Regulation
                </label>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={previousHole}
                disabled={isFirstHole || status === 'saving'}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button 
                onClick={handleSave}
                disabled={status === 'saving'}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              
              {isLastHole ? (
                <Button 
                  variant="default" 
                  onClick={handleFinishRound}
                  disabled={status === 'saving'}
                >
                  Finish Round
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  onClick={nextHole}
                  disabled={isLastHole || status === 'saving'}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {status === 'saving' && (
        <div className="text-center text-sm text-muted-foreground animate-pulse">
          Saving...
        </div>
      )}
    </div>
  );
};
