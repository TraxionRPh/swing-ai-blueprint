
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useRound } from "@/context/RoundContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, AlertCircle, Edit } from "lucide-react";
import { RoundHeader } from "./RoundHeader";
import { LoadingState } from "./LoadingState";

interface RoundReviewProps {
  onBack: () => void;
}

export const RoundReview = ({ onBack }: RoundReviewProps) => {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentRoundId,
    setCurrentRoundId,
    selectedCourse,
    holeScores,
    holeCount,
    finishRound,
    isLoading
  } = useRound();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Initialize the component
  useEffect(() => {
    if (roundId && roundId !== 'new') {
      setCurrentRoundId(roundId);
    }
  }, [roundId, setCurrentRoundId]);
  
  // Calculate round totals
  const totals = holeScores.reduce((acc, hole) => ({
    score: acc.score + (hole.score || 0),
    putts: acc.putts + (hole.putts || 0),
    fairways: acc.fairways + (hole.fairwayHit ? 1 : 0),
    greens: acc.greens + (hole.greenInRegulation ? 1 : 0),
    parCount: acc.parCount + (hole.score === hole.par ? 1 : 0),
    birdieCount: acc.birdieCount + (hole.score === hole.par - 1 ? 1 : 0),
    eagleCount: acc.eagleCount + (hole.score <= hole.par - 2 ? 1 : 0),
    bogeyCount: acc.bogeyCount + (hole.score === hole.par + 1 ? 1 : 0),
    doubleCount: acc.doubleCount + (hole.score >= hole.par + 2 ? 1 : 0),
  }), {
    score: 0,
    putts: 0,
    fairways: 0,
    greens: 0,
    parCount: 0,
    birdieCount: 0,
    eagleCount: 0,
    bogeyCount: 0,
    doubleCount: 0,
  });
  
  // Calculate relation to par
  const totalPar = holeScores.reduce((sum, hole) => sum + hole.par, 0);
  const scoreToPar = totals.score - totalPar;
  
  const scoreRelationText = scoreToPar === 0
    ? "Even par"
    : scoreToPar > 0
      ? `+${scoreToPar}`
      : scoreToPar;
  
  // Handle editing a specific hole
  const handleEditHole = (holeNumber: number) => {
    navigate(`/rounds/${roundId}/${holeNumber}`);
  };
  
  // Handle submitting the final round
  const handleSubmitRound = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);
    
    try {
      const success = await finishRound();
      
      if (success) {
        setSubmitSuccess(true);
        toast({
          title: "Round Completed",
          description: "Your round has been saved successfully",
        });
        
        // Navigate back to rounds list after a short delay
        setTimeout(() => {
          navigate("/rounds");
        }, 1500);
      } else {
        setSubmitError("Could not complete round. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting round:", error);
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <LoadingState onBack={onBack} message="Loading round data..." />;
  }
  
  return (
    <div className="space-y-6">
      <RoundHeader
        title="Round Review"
        subtitle={selectedCourse?.name || "Review your round scores"}
        onBack={onBack}
      />
      
      {/* Round Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Round Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
              <div className="text-xl font-bold">{totals.score}</div>
              <div className="text-xs text-muted-foreground">Total Score</div>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
              <div className="text-xl font-bold">{scoreRelationText}</div>
              <div className="text-xs text-muted-foreground">vs. Par</div>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
              <div className="text-xl font-bold">{totals.putts}</div>
              <div className="text-xs text-muted-foreground">Total Putts</div>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
              <div className="text-xl font-bold">{(totals.putts / holeCount).toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Putts per Hole</div>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mt-6">
            <div className="text-center p-2">
              <div className="text-xs text-muted-foreground mb-1">Eagles</div>
              <div className="bg-green-100 text-green-800 text-lg font-bold rounded-full w-10 h-10 mx-auto flex items-center justify-center">
                {totals.eagleCount}
              </div>
            </div>
            <div className="text-center p-2">
              <div className="text-xs text-muted-foreground mb-1">Birdies</div>
              <div className="bg-green-100 text-green-800 text-lg font-bold rounded-full w-10 h-10 mx-auto flex items-center justify-center">
                {totals.birdieCount}
              </div>
            </div>
            <div className="text-center p-2">
              <div className="text-xs text-muted-foreground mb-1">Pars</div>
              <div className="bg-gray-100 text-gray-800 text-lg font-bold rounded-full w-10 h-10 mx-auto flex items-center justify-center">
                {totals.parCount}
              </div>
            </div>
            <div className="text-center p-2">
              <div className="text-xs text-muted-foreground mb-1">Bogeys</div>
              <div className="bg-yellow-100 text-yellow-800 text-lg font-bold rounded-full w-10 h-10 mx-auto flex items-center justify-center">
                {totals.bogeyCount}
              </div>
            </div>
            <div className="text-center p-2">
              <div className="text-xs text-muted-foreground mb-1">Doubles+</div>
              <div className="bg-red-100 text-red-800 text-lg font-bold rounded-full w-10 h-10 mx-auto flex items-center justify-center">
                {totals.doubleCount}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Hole-by-hole scores */}
      <Card>
        <CardHeader>
          <CardTitle>Hole-by-hole Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hole</TableHead>
                <TableHead>Par</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>+/-</TableHead>
                <TableHead>Putts</TableHead>
                <TableHead>FIR</TableHead>
                <TableHead>GIR</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holeScores.slice(0, holeCount).map((hole) => {
                // Determine score relation class
                const scoreDiff = hole.score - hole.par;
                let scoreClass = "bg-gray-100 text-gray-700";
                let scoreText = "E";
                
                if (hole.score > 0) {
                  if (scoreDiff < 0) {
                    scoreClass = "bg-green-100 text-green-800";
                    scoreText = scoreDiff.toString();
                  } else if (scoreDiff === 0) {
                    scoreClass = "bg-gray-100 text-gray-700";
                    scoreText = "E";
                  } else {
                    scoreClass = "bg-red-100 text-red-800";
                    scoreText = `+${scoreDiff}`;
                  }
                } else {
                  scoreText = "—";
                }
                
                return (
                  <TableRow key={hole.holeNumber}>
                    <TableCell>{hole.holeNumber}</TableCell>
                    <TableCell>{hole.par}</TableCell>
                    <TableCell>{hole.score || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={scoreClass}>
                        {scoreText}
                      </Badge>
                    </TableCell>
                    <TableCell>{hole.putts !== undefined ? hole.putts : "—"}</TableCell>
                    <TableCell>{hole.fairwayHit ? "✅" : "—"}</TableCell>
                    <TableCell>{hole.greenInRegulation ? "✅" : "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditHole(hole.holeNumber)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back to Round
          </Button>
          <Button onClick={handleSubmitRound} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Round'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Submit status */}
      {(submitSuccess || submitError) && (
        <div className={`flex items-center justify-center p-4 rounded-md ${
          submitSuccess ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {submitSuccess ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              <span>Round completed successfully</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{submitError}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
